import { createContext, useReducer } from "react";

export const TasksContext = createContext();

export const tasksReducer = (state, action) => {
  switch (action.type) {
    case "SET_TASKS":
      return {
        tasks: action.payload,
      };
    case "CREATE_TASK":
      return {
        tasks: [action.payload, ...state.tasks],
      };
    case "DELETE_TASK":
      return {
        tasks: state.tasks.filter((t) => t._id !== action.payload._id),
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t._id === action.payload._id ? action.payload : t
        ),
      };
      case "UPDATE_TASK_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t._id === action.payload._id ? { ...t, status: action.payload.status } : t
        ),
      };
    default:
      return state;
  }
};

export const TasksContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tasksReducer, {
    tasks: [],
  });

  return (
    <TasksContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TasksContext.Provider>
  );
};
