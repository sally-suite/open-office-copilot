import React from "react";

export default function PageFooter() {
  return (
    <footer className="bg-dark text-white">
      <div className=" text-sm py-2 text-center">
        <a
          href="https://www.sally.bot/legal/terms-of-service"
          className="px-2"
        >
          Terms of Service
        </a>
        <a href="https://www.sally.bot/legal/privacy" className="px-2">
          Privacy Policy
        </a>
        <a href="https://www.sally.bot/legal/disclosure" className="px-2">
          Google Sheets Addon Disclosure
        </a>
      </div>
      <div className=" text-center h-10 leading-10 ">©2024 Sally Suite AI All Rights Reserved</div>
    </footer>
  );
}

export function PageFooter1() {
  return (
    <footer className="bg-dark text-white">
      <div className="flex flex-row justify-between w-[900px] mx-auto ">
        <div className=" w-1/2 ">
          <div className=" text-xl py-2">
            Contact us
          </div>
          <p>
            Name: penny.hao
          </p>
          <p>
            Email: penny.hao@shituconsulting.com/
          </p>
          <p>
            Address:<br /> Futong Tianjun, No.368 Longfa Road, Longhua Street, Longhua District, Shenzhen, Guangdong, 518109, China
          </p>
        </div>
        <div className=" w-1/4 flex flex-col text-sm py-2 text-left">
          <div className=" text-xl py-2">
            Legal
          </div>
          <a
            href="https://www.sally.bot/docs/terms-of-service"
            className="py-2"
          >
            Terms of Service
          </a>
          <a href="https://www.sally.bot/legal/privacy" className="py-2">
            Privacy Policy
          </a>
          <a href="https://www.sally.bot/docs/disclosure" className="py-2">
            Google Sheets Addon Disclosure
          </a>
        </div>
      </div>

      <div className=" text-center h-10 leading-10 ">©2024 Sally Suite AI All Rights Reserved</div>
    </footer>
  );
}
