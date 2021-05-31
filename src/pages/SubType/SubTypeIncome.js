import SalaryDetails from "../../shared/components/SalaryDetails/SalaryDetails";
import jsonData from "../../shared/constants/data.json";
import Layout from "../../Layout";
import Button from "../../shared/components/Button";
import Footer from "../../shared/components/Footer";
import EMIDetails from "../../shared/components/EMIDetails";

export default function CoApplicantIncome(props) {
  console.log(jsonData);
  return (
    <Layout>
      <SalaryDetails jsonData={jsonData.salary_details.data} />
      <section className="py-4">
        <small>
          Do you want to include the co-applicant's salary to be included in the
          loan eligibility calculations?
        </small>
        <section className="flex w-2/12 py-4 justify-between">
          <Button>Yes</Button>
          <Button>No</Button>
        </section>
      </section>
      <EMIDetails jsonData={jsonData.emi_details.data} />
      <Footer cancel={true} click={props.click} />
    </Layout>
  );
}
