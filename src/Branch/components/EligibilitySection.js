import Button from "../shared/components/Button";

const valueConversion = {
  Thousand: 1000,
  Lakhs: 100000,
  Crores: 10000000,
  Millions: 1000000,
  One: 1,
};

const amountFields = ["loan_price"];

export default function EligibilitySection({
  disabled,
  onfieldChanges,
  data,
  mapper,
  item,
  clickSub,
  assignmentLog,
  setComment,
  reassignLoan,
  comment,
  e,
  d,
  setError,
  setMessage,
  
}) {
  const amountConverter = (value, name) => {
    if (amountFields.includes(name)) {
      return value * valueConversion[data?.assets_value_um || "One"];
    }

    return value;
  };
  return (
    <section className="w-full flex">
      <section className="w-1/2">
        {Object.keys(mapper[e]).map((i) => (
          <section>
            <p className="text-blue-700 font-medium text-xl pb-8 p2">{i}</p>
            {d()[e] &&
              Object.keys(d()[e]).map(
                (k) =>
                  mapper[e][i] &&
                  Object.keys(mapper[e][i]).map(
                    (l) =>
                      l === k && (
                        <section className="flex space-evenly py-2 items-center">
                          <label className="w-1/2">{mapper[e][i][k]}</label>
                          <input
                            className="rounded-lg p-4 border"
                            disabled={disabled}
                            placeholder={mapper[e][i][k]}
                            defaultValue={d()[e][k]}
                          />
                        </section>
                      )
                  )
              )}
            <section className="flex space-evenly py-2 items-center">
              <label className="w-1/2">Loan Amount</label>
              <input
                className="rounded-lg p-4 border"
                disabled={disabled}
                name={"loan_price"}
                onChange={onfieldChanges}
                defaultValue={amountConverter(data?.loan_amount, "loan_price")}
              />
            </section>
            <section className="flex space-evenly py-2 items-center">
              <label className="w-1/2">DSCR</label>
              <input
                className="rounded-lg p-4 border"
                disabled={disabled}
                name={"DSCR"}
                onChange={onfieldChanges}
                placeholder="DSCR"
                defaultValue={Number(item?.dscr).toFixed(2)}
              />
            </section>
            <section className="flex space-evenly py-2 items-center">
              <label className="w-1/2">Tenure</label>
              <input
                className="rounded-lg p-4 border"
                disabled={disabled}
                name={"Tenure"}
                onChange={onfieldChanges}
                placeholder="Tenure"
                defaultValue={item?.applied_tenure}
              />
            </section>
            <section className="flex space-evenly py-2 items-center">
              <label className="w-1/2">Income</label>
              <input
                className="rounded-lg p-4 border"
                disabled={disabled}
                name={"income"}
                onChange={onfieldChanges}
                placeholder="Tenure"
                defaultValue={item?.net_monthly_income || item?.gross_income}
              />
            </section>
          </section>
        ))}
        <Button
          onClick={() => clickSub()}
          type="blue"
          rounded="rfull"
          size="small"
          disabled={disabled}
        >
          Submit
        </Button>
      </section>

      <section
        className="w-1/4 fixed right-0 bg-gray-200 flex flex-col  gap-y-8 pb-64 top-24 h-full p-6"
        style={{
          overflow: "scroll",
        }}
      >
        <p className="text-xl font-medium">Comments</p>
        {assignmentLog && (
          <>
            {Object.keys(JSON.parse(assignmentLog)).map((el) => (
              <section className="bg-white flex flex-col gap-y-6 p-2 rounded-lg">
                <span className="text-sm font-semibold">
                  {JSON.parse(assignmentLog)[el]?.name}
                </span>

                {JSON.parse(assignmentLog)[el]?.type === "Comments" &&
                  JSON.parse(assignmentLog)[el]?.message}

                <span className="text-xs font-semibold text-blue-700">
                  {el}
                </span>
              </section>
            ))}
          </>
        )}
        <section className="flex gap-x-2 fixed bottom-0 pr-10 pl-2 rounded pb-4 pt-3 bg-gray-400  items-center ">
          <input
            placeholder="Add Comment"
            className="p-1 rounded-md px-2 focus:outline-none" 
            onChange={(e) => setComment(e.target.value)}
          />

          <Button
            rounded="rfull"
            type="blue-light"
            size="small"
            onClick={() => {
              reassignLoan(item.id, null, comment).then((res) => {
                if (res === "Error in uploading") {
                  setError(true);
                  setTimeout(() => {
                    setError(false);
                  }, 4000);
                } else {
                  setMessage(true);
                  setTimeout(() => {
                    setMessage(false);
                  }, 4000);
                  setComment([]);
                }
              });
            }}
          >
            Add comment
          </Button>
        </section>
      </section>
    </section>
  );
}
