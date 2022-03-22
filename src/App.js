/* eslint-disable react/jsx-no-target-blank */
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import "./App.css";
import SmartCircle from "./components/SmartCircle";
import { copyToClipboard } from "./utils/copyToClipboard";

const getRandomColor = () =>
  Math.floor(getRandomIntInclusive(1000, 16777215)).toString(16);

// we use getRandomIntInclusive to not have dark/black

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const formatData = (routines) => {
  // transforms the array of routines into the array of hours, feedable to d3
  // the array should look the same, but we need something even with no activity

  // 0 format the input
  // 1 initiate the array of all timeframes
  // 2 insert values of user into the allTimeframesArray
  // 3 format the output: make blocks of same things

  // clean the input

  const _routines = routines.map((routine) => {
    return {
      ...routine,
      fromTime: parseInt(routine.fromTime),
      toTime: parseInt(routine.toTime)
    };
  });

  const allTimeframesArray = Array.from({ length: 48 }, (_, n) => {
    return {
      color: "#FFFFFF",
      fromTime: n * 30,
      toTime: (n + 1) * 30,
      type: ""
    };
  });

  _routines.forEach((routine) => {
    const indexes = getTimeframesFromRoutine(routine);
    indexes.forEach((v) => {
      allTimeframesArray[v.index] = v.value;
    });
  });

  // make blocks
  const allTimeframesArrayWithBlocks = makeBlocks(allTimeframesArray);
  return allTimeframesArrayWithBlocks;
};

const makeBlocks = (allTimeframesArray) => {
  // should take connexes blocks of same type to make it one big block
  // [{from: 0, to: 30}, {from: 30, to: 60}] ==> [{from: 0, to: 60}]
  let res = [allTimeframesArray[0]];
  allTimeframesArray?.forEach((routine) => {
    const lastValue = res?.[res?.length - 1];
    if (routine?.type == lastValue.type) {
      lastValue.toTime = routine.toTime;
      res[res.length - 1] = lastValue;
    } else {
      res.push(routine);
    }
  });
  return res;
};

const getTimeframesFromRoutine = (routine) => {
  // figure out all the timeframes used by this routine
  // returns an array of the indexes n needed to be changed in allTimeframesArray
  // converts {fromTime: "0", toTime: "60",} into [0, 1]
  const timeframe = routine.toTime - routine.fromTime;
  let res = [
    {
      index: routine.fromTime / 30,
      value: {
        ...routine,
        toTime: routine.fromTime + 30
      }
    }
  ];
  if (timeframe > 30) {
    for (let i = 1; i < timeframe / 30; i++) {
      res.push({
        index: i + routine.fromTime / 30,
        value: {
          ...routine,
          fromTime: routine.fromTime + i * 30,
          toTime: routine.fromTime + (i + 1) * 30
        }
      });
    }
  }
  return res;
};

const selectPossibilies = Array.from({ length: 49 }, (_, n) => {
  return {
    label: `${Math.floor(n / 2).toLocaleString("fr-FR", {
      minimumIntegerDigits: 2
    })}:${((n % 2) * 30).toLocaleString("fr-FR", {
      minimumIntegerDigits: 2
    })}`,
    value: n * 30
  };
});

function App() {
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);

    for (let param of params) {
      if (param.length > 0 && param[0].length > 1) {
        const jsonArr = JSON.parse(param[0]);
        setRoutines(jsonArr);
      }
    }
  }, []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { isDirty }
  } = useForm();

  const { fields, append, remove, update } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "routines" // unique name for your Field Array
  });

  const onSubmit = (data) => {
    setRoutines(data.routines);
  };

  const share = async () => {
    await copyToClipboard(
      window.location + `?${encodeURIComponent(JSON.stringify(routines))}`
    );
    // this doesn't work and makes the copy to clipboard bug for some reason
    // alert(
    //   "Your routine has been copied to your clipboard ! You can now share it by pasting it in any conversation"
    // );
  };

  const values = watch("routines", []);

  useEffect(() => {
    // handle the actions happening when form has changed (QoL)
    // when I change a value from "fromTime" field, it needs to update the value of "toTime"
  }, [values, update]);

  return (
    <>
      <div className="flex flex-col items-center min-w-screen min-h-screen bg-gray-200 space-y-8 pb-5">
        <header className="text-center w-full border-b border-black">
          <h1 className="font-bold text-xl p-5">Routine Around the Clock</h1>
        </header>

        {routines?.length > 0 ? (
          <>
            <SmartCircle routines={formatData(routines)}></SmartCircle>

            <button
              className="mb-16 px-5 py-3 bg-blue-400 rounded w-44"
              onClick={share}>
              Share my routine
            </button>
          </>
        ) : (
          <div className="px-20 py-5 w-full flex flex-col items-center">
            <div>
              <p>
                Here you can vizualise your routine with a visual tool that will
                help you get things done
              </p>
              <p>
                In just a few clicks, you'll vizualise an amazing routine plan
                to meet your goals !
              </p>
              <p className="pt-5">
                First, you need to click on{" "}
                <span className="text-cyan-400">Add a routine</span>, to start
                adding routines to your day
              </p>
              <p>
                Then, you can customize your routines: give them a name, a
                color, and a timeframe
              </p>
              <p>
                Finally, you just click on the{" "}
                <span className="text-blue-600">Vizualise button</span>, to
                visualize your daily routine around the clock !
              </p>

              <p>
                This work has been inspired by the research by{" "}
                <a href="https://infowetrust.com/" target="_blank">
                  infowetrust
                </a>
                , in particular{" "}
                <a
                  href="https://infowetrust.com/wp-content/uploads/2019/12/creative-routines-edit4-scaled.png"
                  target="_blank">
                  this infography
                </a>
              </p>
            </div>
          </div>
        )}

        <form
          className="flex flex-col space-y-4 bg-blue-50 rounded-lg p-4 items-center"
          onSubmit={handleSubmit(onSubmit)}>
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-row justify-between space-x-5 pb-3">
              <label>De</label>
              <select {...register(`routines.${index}.fromTime`)}>
                {selectPossibilies.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label>A</label>
              <select {...register(`routines.${index}.toTime`)}>
                {selectPossibilies.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <input {...register(`routines.${index}.type`)}></input>
              <input
                type="color"
                {...register(`routines.${index}.color`)}></input>

              <button type="button" onClick={() => remove(index)}>
                Delete
              </button>
            </div>
          ))}
          <button
            className="bg-cyan-200 px-5 py-2 rounded w-44"
            type="button"
            onClick={() =>
              append({
                color: `#${getRandomColor()}`,
                fromTime:
                  values?.length > 0 ? values[values.length - 1].toTime : "0",
                toTime:
                  values?.length > 0
                    ? parseInt(values[values.length - 1].toTime) + 60
                    : "60",
                type: "Sleep"
              })
            }>
            Add a routine
          </button>
          <button
            className="px-5 py-3 bg-blue-400 rounded w-44 disabled:bg-gray-300"
            type="submit"
            disabled={!isDirty}>
            Vizualise
          </button>
        </form>
      </div>
      <footer className="w-full border-t border-t-black p-4 bg-gray-100 text-center">
        <p>Made with ❤️ by Pierre-Étienne Soury - 2022 - MIT Licence</p>
      </footer>
    </>
  );
}

export default App;
