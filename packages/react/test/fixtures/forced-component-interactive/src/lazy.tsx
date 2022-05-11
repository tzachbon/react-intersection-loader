export default function LazyComponent({ title }: { title: string }) {
  return (
    <div
      id="lazy"
      style={{
        height: '100vh',
        width: '100vw',
        background: 'salmon',
      }}
    >
      <h1>{title}</h1>
    </div>
  );
}
