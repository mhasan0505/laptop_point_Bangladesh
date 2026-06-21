import { NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function validateContactForm(data: unknown): { valid: boolean; errors?: string[] } {
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid request body"] };
  }

  const body = data as Record<string, unknown>;
  const errors: string[] = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2) errors.push("Name must be at least 2 characters");
  if (!email.includes("@") || !email.includes(".")) errors.push("Invalid email address");
  if (subject.length < 5) errors.push("Subject must be at least 5 characters");
  if (message.length < 10) errors.push("Message must be at least 10 characters");

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateContactForm(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.errors },
        { status: 400 },
      );
    }

    const data = body as ContactFormData;

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log the submission. In production, replace with:
    // await resend.emails.send({
    //   from: "contact@laptoppointbd.com",
    //   to: process.env.ADMIN_EMAIL || "admin@laptoppointbd.com",
    //   subject: `Contact Form: ${data.subject}`,
    //   html: `<p><strong>From:</strong> ${data.name} (${data.email})</p><p><strong>Subject:</strong> ${data.subject}</p><p>${data.message}</p>`,
    // });

    console.log("[Contact Form]", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
