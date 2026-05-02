import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Cloud servers (like Render) ke liye yeh exact config zaroori hai
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Secure port
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Render ke connection timeouts ko rokne ke liye:
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;