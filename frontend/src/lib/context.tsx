import { createContext, useState } from "react";

export type Campaign = {
    name: string;
    description: string;
};

export const InitialiseCampaign: Campaign = {
    name: "",
    description: "",
};
export const CampaignContext = createContext<Campaign>(InitialiseCampaign);
export const CampaignDispatchContext = createContext<React.Dispatch<any>>(
  () => {}
);

export const CampaignContextProvider = ({ children, initialState }: any) => {
  const [state, dispatch] = useState(initialState);

  return (
    <>
      <CampaignContext.Provider value={state || null}>
        <CampaignDispatchContext.Provider value={dispatch}>
          {children}
        </CampaignDispatchContext.Provider>
      </CampaignContext.Provider>
    </>
  );
};
