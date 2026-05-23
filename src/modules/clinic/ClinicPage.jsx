import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { formatDate } from "../../shared/utils/format";

const ClinicPage = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClinic = async () => {
      try {
        const [patientsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
          api.get("/clinic/patients"),
          api.get("/clinic/appointments"),
          api.get("/clinic/prescriptions"),
        ]);
        setPatients(patientsRes.data);
        setAppointments(appointmentsRes.data);
        setPrescriptions(prescriptionsRes.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load clinic data.");
      } finally {
        setLoading(false);
      }
    };

    loadClinic();
  }, []);

  if (loading) return <Loader label="Loading clinic module..." />;

  return (
    <div className="page-stack">
      <PageHeader
        title="Clinic"
        subtitle="Add-on clinic workspace for patients, appointments, prescriptions, doctor consultation notes, lab billing placeholders, and follow-up reminders."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="split-grid">
        <SectionCard title="Patients">
          <DataTable
            columns={[
              { key: "name", label: "Patient registration" },
              { key: "phone", label: "Phone" },
              { key: "medicalHistory", label: "Patient medical history" },
            ]}
            rows={patients}
          />
        </SectionCard>

        <SectionCard title="Appointments">
          <DataTable
            columns={[
              { key: "doctorName", label: "Doctor profile" },
              { key: "appointmentDate", label: "Appointment booking", render: (row) => formatDate(row.appointmentDate) },
              { key: "status", label: "Status" },
              { key: "followUpReminder", label: "Follow-up reminders" },
            ]}
            rows={appointments}
          />
        </SectionCard>
      </div>

      <div className="split-grid">
        <SectionCard title="Prescriptions">
          <DataTable
            columns={[
              { key: "doctorName", label: "Doctor consultation" },
              { key: "diagnosis", label: "Prescription generation" },
              {
                key: "medicines",
                label: "Medicines",
                render: (row) => row.medicines?.map((item) => `${item.name} ${item.dosage}`).join(", "),
              },
              {
                key: "labTests",
                label: "Lab tests",
                render: (row) =>
                  row.labTests?.map((item) => `${item.type} (${item.status})`).join(", ") || "No lab tests",
              },
            ]}
            rows={prescriptions}
          />
        </SectionCard>

        <SectionCard title="Lab billing">
          <div className="feature-list">
            <div className="feature-item">Lab test billing placeholder</div>
            <div className="feature-item">Doctor consultation placeholder</div>
            <div className="feature-item">Patient history ready to expand from seeded records</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ClinicPage;
