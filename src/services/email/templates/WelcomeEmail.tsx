import { Heading, Section, Text } from "react-email";

import { Button } from "../components/Button";
import { EmailLayout } from "../components/EmailLayout";

export interface WelcomeEmailProps {
  companyName: string;
  userName: string;
  dashboardUrl: string;
  logoUrl?: string;
}

export function WelcomeEmail({ companyName, userName, dashboardUrl, logoUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to ${companyName}!`} companyName={companyName} logoUrl={logoUrl}>
      <Heading as="h1" className="m-0 mb-5 text-center text-[32px] font-bold text-fg">
        Welcome aboard!
      </Heading>

      <Text className="mx-auto mb-8 mt-0 max-w-[420px] text-center text-[16px] leading-7 text-fg-2">
        Hi {userName}, thanks for joining {companyName}. We're excited to have you on board. Get
        started by exploring your dashboard.
      </Text>

      <Section className="mb-8 text-center">
        <Button href={dashboardUrl}>Go to Dashboard</Button>
      </Section>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  companyName: "Acme",
  userName: "Jane",
  dashboardUrl: "https://app.acme.com/dashboard",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
