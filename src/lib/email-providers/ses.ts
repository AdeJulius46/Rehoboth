import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const region = process.env.AWS_REGION;
const fromEmail = process.env.SES_FROM_EMAIL;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const sesClient =
  region && accessKeyId && secretAccessKey
    ? new SESClient({ region, credentials: { accessKeyId, secretAccessKey } })
    : null;

export function isSesConfigured() {
  return !!(sesClient && fromEmail);
}

export async function sendEmailViaSes({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!sesClient || !fromEmail) {
    throw new Error("SES is not configured — missing AWS_REGION, AWS credentials, or SES_FROM_EMAIL.");
  }

  await sesClient.send(
    new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
        },
      },
    }),
  );
}
