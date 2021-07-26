export default function Card(props) {
  const {
    reconsider,
    reopen,
    security,
    status,
    download,
    approvalHistory,
    reassign,
    queries,
    comments,
    recommendation,
    reasonForRejection,
    AR,
    full,
    small,
    medium,
  } = props;

  const getter = () => {
    if (
      reconsider ||
      reopen ||
      security ||
      status ||
      download ||
      approvalHistory ||
      reassign ||
      queries ||
      comments ||
      recommendation ||
      reasonForRejection ||
      AR
    )
      return true;
  };
  return (
    <main
      style={{
        boxShadow: "0 0 19px 0px #98AFC7",
        flex: "1",
        // height: `${getter() ? 'auto' : small ? 'auto' : medium ? '16rem' : '23rem'}`,
        // maxHeight: `${getter() ? '80rem' : 'auto'}`,
        // width: `${!full ? 'calc(100%/3)' : '100%'}`,
        // maxWidth: `${getter() ? '100%' : '100%'}`
      }}
      className={` p-6  rounded-md flex-flex-col flex`}
      //   ${full && "w-full"}
    >
      {props.head && (
        <section className="pb-6 flex flex-col gap-y-2">
          <small className="text-sm">
            {props.head && props.head.toUpperCase()}
          </small>
          {props.head && <hr />}
        </section>
      )}
      {props.children}
    </main>
  );
}
