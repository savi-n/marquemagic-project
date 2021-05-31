export default function configureFlow(flow) {
  flow = flow.map((element, index, array) => {
    element.nextFlow = array[index + 1]?.id ?? null;
    return element;
  });

  return flow;
}
