import {createContext, useContext, useState} from "react";

const CodeBlockContext = createContext({
  tabOrder: [],
  setActiveTab: (_1, _2?) => {
    return;
  },
  setFromLocalStorage: () => {
    return;
  },
});

const SELECTED_TABS_LOCAL_STORAGE_KEY = `amplify-docs::selected-tabs`;

const restoreBlockSwitcherState = function() {
  if (typeof localStorage === "undefined") return [];
  // Gather list of previously-selected tab headings (might be null)
  const persistedSelectedTabsSerialized =
    localStorage.getItem(SELECTED_TABS_LOCAL_STORAGE_KEY) || undefined;
  if (persistedSelectedTabsSerialized) {
    // save that selection array if it exists (otherwise, list is empty)
    return JSON.parse(persistedSelectedTabsSerialized);
  }
  return [];
};

export default function CodeBlockProvider({children}) {
  const [tabOrder, setTabOrder] = useState([]);

  const setFromLocalStorage = () => {
    setTabOrder((oldTabOrder) => {
      const localStorageTabOrder = restoreBlockSwitcherState();
      const newTabOrder = [];
      // First add the state from local storage
      for (const tabName of localStorageTabOrder) {
        if (!newTabOrder.includes(tabName)) {
          newTabOrder.push(tabName);
        }
      }
      // If we had any state loaded already, put it at the end
      for (const tabName of oldTabOrder) {
        if (!newTabOrder.includes(tabName)) {
          newTabOrder.push(tabName);
        }
      }
      return newTabOrder;
    });
  };

  const setActiveTab = (tabName, saveToLocalStorage = true) => {
    setTabOrder((oldTabOrder) => {
      // Break out early to avoid rerendering if the currently active tab is clicked
      if (tabName === oldTabOrder[0]) return;
      // Create temp array with `tabHeading` (the new highest priority) as the first element
      const newTabOrder = new Array<string>();
      newTabOrder.push(tabName);

      // Iterate through previous `selectedTabHeadings`
      oldTabOrder.forEach((e) => {
        // No repeats allowed!
        if (tabName !== e) {
          // Ensure preexisting tab name priorities are preserved
          newTabOrder.push(e);
        }
      });

      // Serialize and save to local storage
      if (typeof localStorage !== "undefined" && saveToLocalStorage) {
        localStorage.setItem(
          SELECTED_TABS_LOCAL_STORAGE_KEY,
          JSON.stringify(newTabOrder),
        );
      }

      // And return the new priority list to set it in state
      return newTabOrder;
    });
  };

  const value = {tabOrder, setActiveTab, setFromLocalStorage};
  return (
    <CodeBlockContext.Provider value={value}>
      {children}
    </CodeBlockContext.Provider>
  );
}

export function useCodeBlockContext() {
  const context = useContext(CodeBlockContext);
  return context;
}
