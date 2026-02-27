// Type stubs for packages that are installed at a later milestone.
// Remove these declarations once the real packages are installed.

// nodemailer — used by src/app/api/feedback/route.ts
// Install: npm install nodemailer @types/nodemailer
declare module 'nodemailer' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodemailer: any;
  export default nodemailer;
}

// resend — used by src/app/api/feedback/route.ts
// Install: npm install resend
declare module 'resend' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export class Resend { constructor(...args: any[]); [key: string]: any; }
}
