interface AppRoute {
  path: string;
  name: string;
}

const routes: AppRoute[] = [
  { path: "/folders", name: "My Folders" },
  { path: "/", name: "Prioritize" },
  { path: "/decision-criteria", name: "Dimensions" },
  { path: "/scales", name: "Scales" },
  
];

export default routes;
