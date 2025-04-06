
import Email from "/public/icons/email.svg";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import QaList from '@/components/QaList'
import Image from "next/image";

export default function Home() {

  return (
    <main className=" bg-slate-100 " id="main">
      <PageHeader />
      <section className="flex flex-col container p-4 mx-auto md:p-8 md:flex md:flex-row  md:mt-10 md:mb-10 items-center md:space-x-8">
        <div
          className="w-full md:flex-1  md:relative z-10"
          id="headerImg"
        >

          <Image width="560" height="315"
            src="/image/sally-suite.png"
            alt="Wellcom to try Sally Suite"
            className="w-full h-60 shadow-2xl rounded-xl md:h-96">
          </Image>

        </div>
        <div
          className="md:flex-1 md:relative "
          id="headerDesc"
        >

          <h1 className="text-3xl mt-5 mb-5 md:text-5xl font-bold text-title md:mb-10">
            AI-Agent based Copilot
          </h1>

          <p className=" md:mt-4 text-gray-800">
            Welcome to use our AI-Agent based Copilot, It&apos;s a thinking, working, scalable Copilot.
            It supports both Google Workspace and Microsoft Office.
          </p>
          <ul className="mt-2">
            <li>
              <b>Thinking:</b> Can recommend functions, charts and analyze data in Spreadsheets , improve writing in Doc and Slide etc.
            </li>
            <li>
              <b> Working:</b> Can generate code, performing heavy tasks like data cleaning, generate presentation, generate article etc.
            </li>
            <li>
              <b>Scalable:</b> Can customize Agent according to your requirements.
            </li>
          </ul>
        </div>
      </section>

      <section id="qa" className="pt-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-title">
            Q & A
          </h2>
          <div className="flex flex-col p-4 mt-8 md:flex-row md:justify-center">
            <QaList />
          </div>
        </div>
      </section>

      <div id="contact" className="pt-20 pb-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-title">Contact Us</h2>
          <p className="p-2 mt-4">
            If there are any questions or suggestions, you can contact me by
            email and I will reply within 24 hours!
          </p>
          <p>
            You can also follow us on Twitter to get the latest information on
            product progress.
          </p>
          <div className=" flex flex-row justify-center pt-20 ">
            <a
              className="p-2 rounded-full border-dark border-2 mx-4 cursor-pointer"
              href="mailto:sally-suite@hotmail.com"
            >
              <Email className=" w-6 h-6  fill-dark cursor-pointer" />
            </a>{" "}

          </div>
        </div>
      </div>


      <PageFooter />
    </main >
  );
}