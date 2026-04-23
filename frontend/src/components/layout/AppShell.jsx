import Navbar from "./Navbar";
import PageContainer from "./PageContainer";

export default function AppShell({ children }) {
  return (
    <>
      <Navbar />
      <PageContainer>{children}</PageContainer>
    </>
  );
}