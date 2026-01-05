import { ProjectProvider } from "./ProjectContext";
import { ScoringScaleProvider } from "./ScoringScaleContext";
import { DriverProvider } from "./DecisionDriverContext";
import { ItemsProvider } from "./ItemsContext";

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectProvider>
      <ScoringScaleProvider>
        <DriverProvider>
          <ItemsProvider>{children}</ItemsProvider>
        </DriverProvider>
      </ScoringScaleProvider>
    </ProjectProvider>
  );
};

export { DataProvider };

// Export all hooks from individual context files
export * from "./ProjectContext";
export * from "./ScoringScaleContext";
export * from "./DecisionDriverContext";
export * from "./ItemsContext";