import React, { useEffect, useState } from "react";
import { VoyageProvider, Wallet, getLogicDriver } from "js-moi-sdk";
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

// ------- Update with your credentials ------------------ //
//
const logicId =
  "0x08000033cd8b8dda1ac3bb45f971bfb0d78507ff5025e00a995ccddbf5af58fa1e77ab";
const mnemonic =
  "siege ugly beyond heavy napkin taste hover aerobic sure stomach observe high";

const logicDriver = await gettingLogicDriver(
  logicId,
  mnemonic,
  "m/44'/6174'/7020'/0/0",
);

async function gettingLogicDriver(logicId, mnemonic, accountPath) {
  const provider = new VoyageProvider("babylon");
  const wallet = new Wallet(provider);
  await wallet.fromMnemonic(mnemonic, accountPath);
  return await getLogicDriver(logicId, wallet);
}

function App() {
  const [todoName, setTodoName] = useState("");
  const [address, setAddress] = useState("");
  const [todos, setTodos] = useState([]);
  const [listAddresses, setListAddresses] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [userAdding, setUserAdding] = useState(false);

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const handleAdddress = (e) => {
    setAddress(e.target.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos");
      setTodos(tTodos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const getAddress = async () => {
    try {
      const addresses = await logicDriver.persistentState.get("secondaryUsers");
      console.log(addresses);
      setListAddresses(addresses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const addUser = async (e) => {
    e.preventDefault();
    try {
      setUserAdding(true);
      info("Adding users ...");

      const ix = await logicDriver.routines.AddUser([address]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });

      await ix.wait();
      await getAddress();

      success("Successfully added User");
      setUserAdding(false);
      console.log(listAddresses);
    } catch (error) {
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      info("Adding Todo ...");

      const ix = await logicDriver.routines.Add([todoName]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });

      // Waiting for tesseract to be mined
      await ix.wait();

      await getTodos();
      success("Successfully Added");
      setTodoName("");
      setAdding(false);
    } catch (error) {
      console.log(error);
    }
  };

  const markCompleted = async (id) => {
    try {
      setMarking(id);
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
      // Waiting for tesseract to be mined
      await ix.wait();

      // const updatedTodos = todos.map((todo, index) => {
      //   if (index === id) {
      //     todo.completed = true;
      //   }
      //   return todo;
      // });

      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <section className="section">
        <form className="todo-form">
          <p>Add New user</p>
          <div className="form-control">
            <input
              value={address}
              name="address"
              onChange={handleAdddress}
              type="text"
              id="todo"
              placeholder="e.g. 0x000"
            />
            <button onClick={addUser} type="submit" class="submit-btn">
              {userAdding ? (
                <Loader color={"#000"} loading={userAdding} />
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>
      </section>
      <section class="section-center">
        <form class="todo-form">
          <p class="alert"></p>
          <h3>Todo buddy</h3>
          <div class="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Attend Moi Event"
            />
            <button onClick={add} type="submit" class="submit-btn">
              {adding ? <Loader color={"#000"} loading={adding} /> : "Add Todo"}
            </button>
          </div>
        </form>
        {!loading ? (
          <div class="todo-container show-container">
            {todos.map((todo, index) => {
              return (
                <div class="todo-list">
                  {todo.name}
                  {todo.completed ? (
                    <img className="icon" src="/images/check.svg" />
                  ) : (
                    <span
                      onClick={() => markCompleted(index)}
                      className="underline text-red pointer"
                    >
                      {marking === index ? (
                        <Loader
                          color={"#000"}
                          loading={marking === 0 ? true : marking}
                        />
                      ) : (
                        "Mark Completed!"
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>
        )}
      </section>
    </>
  );
}

export default App;
