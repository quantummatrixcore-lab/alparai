function MetricWidget(props: any) {
  return <div />;
}

export function MockNegativeTest() {
  const localConst = 95;
  return (
    <div>
      <span>HAZIR (%92)</span>
      <span>%{localConst}</span>
      <MetricWidget score={94} amount={100} />
    </div>
  );
}
