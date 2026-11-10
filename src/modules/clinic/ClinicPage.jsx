import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
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
    <div className="page-stack clinic-page">
      <PageHeader
        title="Clinic"
        subtitle="Review patient records, appointments and prescriptions."
      />

      {error ? <div className="error-banner" role="alert"><strong>Clinic records unavailable</strong><p>{error}</p></div> : null}

      {!error ? (
        <div className="clinic-records">
          <SectionCard title="Patients">
            <DataTable
              columns={[
                { key: "name", label: "Patient", render: (row) => <strong>{row.name || "Not recorded"}</strong> },
                { key: "phone", label: "Phone" },
                { key: "medicalHistory", label: "Medical history" },
              ]}
              rows={patients}
              emptyText="No patients found"
              emptyDescription="No patients were returned by the clinic service."
            />
          </SectionCard>

          <SectionCard title="Appointments">
            <DataTable
              columns={[
                { key: "doctorName", label: "Doctor" },
                { key: "appointmentDate", label: "Appointment date", render: (row) => formatDate(row.appointmentDate) },
                { key: "status", label: "Status", render: (row) => <Badge>{row.status || "Not recorded"}</Badge> },
                { key: "followUpReminder", label: "Follow-up reminder" },
              ]}
              rows={appointments}
              emptyText="No appointments found"
              emptyDescription="No appointments were returned by the clinic service."
            />
          </SectionCard>

          <SectionCard title="Prescriptions">
            <DataTable
              columns={[
                { key: "doctorName", label: "Doctor" },
                { key: "diagnosis", label: "Diagnosis" },
                {
                  key: "medicines",
                  label: "Medicines",
                  render: (row) => row.medicines?.length ? (
                    <ul className="clinic-cell-list">
                      {row.medicines.map((item, index) => <li key={index}><strong>{item.name}</strong>{item.dosage ? <span> &middot; {item.dosage}</span> : null}</li>)}
                    </ul>
                  ) : "No medicines recorded",
                },
                {
                  key: "labTests",
                  label: "Lab tests",
                  render: (row) =>
                    row.labTests?.length ? (
                      <ul className="clinic-cell-list">
                        {row.labTests.map((item, index) => <li key={index}>{item.type}{item.status ? <span> &middot; {item.status}</span> : null}</li>)}
                      </ul>
                    ) : "No lab tests recorded",
                },
              ]}
              rows={prescriptions}
              emptyText="No prescriptions found"
              emptyDescription="No prescriptions were returned by the clinic service."
            />
          </SectionCard>

        </div>
      ) : null}

      <p className="clinic-availability-note">
        This workspace displays existing clinic records. Lab billing and consultation workflows are not available here yet.
      </p>
    </div>
  );
};

export default ClinicPage;
