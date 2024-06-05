import "./App.css";
import { useRef, useReducer, createContext, useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Diary from "./pages/Diary";
import New from "./pages/New";
import Notfound from "./pages/Notfound";
import Edit from "./pages/Edit";

function reducer(state, action) {
  let nextState;

  switch (action.type) {
    case "INIT":
      return action.data;
    case "CREATE": {
      nextState = [action.data, ...state];
      break;
    }
    case "UPDATE": {
      nextState = state.map((item) =>
        String(item.id) === String(action.data.id) ? action.data : item
      );
      break;
    }
    case "DELETE": {
      nextState = state.filter((item) => String(item.id) !== String(action.id));
      break;
    }
    default:
      return state;
  }
  localStorage.setItem("diary", JSON.stringify(nextState));
  return nextState;
}

export const DiaryStateContext = createContext();
export const DiaryDispatchContext = createContext();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, dispatch] = useReducer(reducer, []);
  const idRef = useRef(0);

  useEffect(() => {
    const storedData = localStorage.getItem("diary");
    if (!storedData) {
      setIsLoading(false);
      return;
    }
    const parsedData = JSON.parse(storedData);
    if (!Array.isArray(parsedData)) {
      setIsLoading(false);
      return;
    }
    let maxId = 0;
    parsedData.forEach((item) => {
      if (Number(item.id) > maxId) maxId = Number(item.id);
    });

    idRef.current = maxId + 1;
    dispatch({
      type: "INIT",
      data: parsedData,
    });
    setIsLoading(false);
  }, []);

  const onCreate = (createdDate, emotionId, content) => {
    dispatch({
      type: "CREATE",
      data: {
        id: idRef.current++,
        createdDate,
        emotionId,
        content,
      },
    });
  };

  const onUpdate = (id, createdDate, emotionId, content) => {
    dispatch({ type: "UPDATE", data: { id, createdDate, emotionId, content } });
  };

  const onDelete = (id) => {
    dispatch({ type: "DELETE", id });
  };
  if (isLoading) {
    return <div>데이터 로딩 중 입니다...</div>;
  }
  return (
    // routes 안쪽은 route태그만 ex)div (X)
    <>
      {/* <Header
        title={"Header"}
        leftChild={<Button text={"Left"} />}
        rightChild={<Button text={"right"} />}
      />
      <Button text={"123"} type={"default"} onClick={onClickButton} />
      <Button text={"123"} type={"positive"} onClick={onClickButton} />
      <Button text={"123"} type={"negative"} onClick={onClickButton} /> */}
      {/* <div>
        html의 <a>태그랑 비슷함
        <Link to={"/"}>Home</Link>
        <Link to={"/new"}>뉴</Link>
        <Link to={"/diary"}>다이어리</Link>
      </div> */}
      <DiaryStateContext.Provider value={data}>
        <DiaryDispatchContext.Provider value={{ onCreate, onUpdate, onDelete }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<New />} />
            <Route path="/diary/:id" element={<Diary />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="*" element={<Notfound />} />
          </Routes>
        </DiaryDispatchContext.Provider>
      </DiaryStateContext.Provider>
    </>
  );
}

export default App;
