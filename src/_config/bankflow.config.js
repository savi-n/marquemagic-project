import { ENDPOINT_BANK } from "../_config/app.config";
const BANK_FLOW = {
  sbi: [
    {
      captchaGet: `${ENDPOINT_BANK}/spGetCaptcha`,
      fields: [
        {
          name: "userId",
          placeholder: "User ID",
          rules: {
            required: true,
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          rules: {
            required: true,
          },
        },
        {
          type: "captcha",
          name: "captcha",
          placeholder: "Captcha",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/spSubmitCaptcha`,
    },
    {
      fields: [
        {
          name: "otp",
          placeholder: "OTP",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/spSubmitOtp`,
    },
    {
      type: "accountslist",
      fields: [
        {
          name: "selectedAccount",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/spSelectAccount`,
    },
  ],
  axis: [
    {
      fields: [
        {
          name: "userId",
          placeholder: "User ID",
          rules: {
            required: true,
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/apSubmitDetails`,
    },
    {
      fields: [
        {
          name: "otp",
          placeholder: "OTP",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/apSubmitSecurityAnswer`,
    },
    {
      fields: [
        {
          name: "otp",
          placeholder: "OTP",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/apSubmitOtp`,
    },
  ],
  axisCorp: [
    {
      fields: [
        {
          name: "corporateId",
          placeholder: "Corporate ID",
          rules: {
            required: true,
          },
        },
        {
          name: "userId",
          placeholder: "User ID",
          rules: {
            required: true,
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/acSubmitDetails`,
    },
    {
      fields: [
        {
          name: "otp",
          placeholder: "OTP",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/acSubmitOtp`,
    },
    {
      fields: [
        {
          name: "accountslist",
          placeholder: "Account Select",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/acSubmitAccount`,
    },
  ],

  hdfc: [
    {
      fields: [
        {
          name: "userId",
          placeholder: "User ID",
          rules: {
            required: true,
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          rules: {
            required: true,
          },
        },
        {
          name: "otpMode",
          type: "select",
          placeholder: "OTP Mode",
          options: [
            { name: "Email", value: "Email" },
            { name: "Mobile", value: "Mobile" },
          ],
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/hsSubmitdetails`,
    },
    {
      type: "otp",
      fields: [
        {
          name: "otp",
          placeholder: "OTP",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/hsSubmitOtp`,
    },
    {
      type: "accountslist",
      fields: [
        {
          name: "selectedAccount",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/hsSelectAccount`,
    },
    {
      fields: [
        {
          type: "captcha",
          name: "captcha",
          placeholder: "Captcha",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/hsSubmitCaptcha`,
    },
  ],
  icici: [
    {
      fields: [
        {
          name: "userId",
          placeholder: "User ID",
          rules: {
            required: true,
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/isSubmitDetails`,
    },
  ],
  kotak: [
    {
      type: "form",
      fields: [
        {
          name: "userId",
          placeholder: "User ID",
          rules: {
            required: true,
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/kcSubmitDetails`,
    },
    {
      type: "otp",
      fields: [
        {
          name: "otp",
          rules: {
            required: true,
          },
        },
      ],
      api: `${ENDPOINT_BANK}/kcSubmitOtp`,
    },
  ],
};

export default BANK_FLOW;
