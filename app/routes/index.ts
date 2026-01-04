interface AppRoute {
  path: string;
  name: string;
}

const routes: AppRoute[] = [
  { path: "/", name: "Prioritize" },
  { path: "/decision-criteria", name: "Criteria" },
  { path: "/scales", name: "Scales" },
  { path: "/projects", name: "Projects" },
];

export default routes;
