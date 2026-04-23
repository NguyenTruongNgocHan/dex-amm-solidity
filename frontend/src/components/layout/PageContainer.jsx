export default function PageContainer({ children }) {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 20px 48px",
      }}
    >
      {children}
    </main>
  );
}