export default function LazyComponent() {
  return (
    <div
      id="lazy"
      style={{
        height: '100vh',
        width: '100vw',
        background: 'salmon',
      }}
    >
      <h1>Forced to be in screen</h1>
    </div>
  );
}
