import React from "react";

const Menus = [
  {
    name: "Sheet Chat Add-on",
    children: [
      {
        link: "/docs/introduce",
        name: "Introduce",
      },
    ],
  },
  {
    name: "Legal",
    children: [
      {
        link: "/docs/terms-of-service",
        name: "Terms Of Service",
      },
      {
        link: "/docs/privacy",
        name: "Privacy Policy",
      },
      {
        link: "/docs/disclosure",
        name: "Google Sheets Addon Disclosure",
      },
      {
        link: "/docs/cookie-privacy",
        name: "Cookie Privacy Policy",
      },
    ],
  },
];

const LeftNav = ({ active }: { active: string }) => {
  return (
    <nav className=" bg-white text-black  border-r">
      {Menus.map(({ name, children }) => {
        return (
          <>
            <div className="left-nav-title">
              <h3>{name}</h3>
            </div>
            <ul>
              {children.map((item) => {
                return (
                  <li
                    key={item.name}
                    className={`left-nav-item ${item.link === `/docs/${active}` ? "active" : ""
                      }`}
                  >
                    <a href={item.link}>{item.name}</a>
                  </li>
                );
              })}
            </ul>
          </>
        );
      })}
    </nav>
  );
};

export default LeftNav;
