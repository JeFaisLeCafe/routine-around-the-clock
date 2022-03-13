import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import "./App.css";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";
import { SimpleClock } from "./components/SimpleClock";
import SmartCircle from "./components/SmartCircle";

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

  console.log("_routines", _routines);

  const allTimeframesArray = Array.from({ length: 48 }, (_, n) => {
    return {
      color: "#FFFFFF",
      fromTime: n * 30,
      toTime: (n + 1) * 30,
      type: ""
    };
  });

  console.log("allTimeframesArray early", allTimeframesArray);

  _routines.forEach((routine) => {
    const indexes = getTimeframesFromRoutine(routine);
    indexes.forEach((v) => {
      allTimeframesArray[v.index] = v.value;
    });
  });

  console.log("allTimeframesArray", allTimeframesArray);
  return allTimeframesArray;

  // make blocks
  // const allTimeframesArrayWithBlocks = makeBlocks(allTimeframesArray);
  // console.log("allTimeframesArrayWithBlocks", allTimeframesArrayWithBlocks);
  // return allTimeframesArrayWithBlocks;
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

const selectPossibilies = Array.from({ length: 48 }, (_, n) => {
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
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const { fields, append, remove, update } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "routines" // unique name for your Field Array
  });

  const onSubmit = (data) => {
    console.log(data);
    setRoutines(data.routines);
  };

  const values = watch("routines", []);

  useEffect(() => {
    // handle the actions happening when form has changed (QoL)
    // when I change a value from "fromTime" field, it needs to update the value of "toTime"
  }, [values, update]);

  return (
    <div className="flex flex-col items-center min-w-screen min-h-screen bg-gray-200 p-5">
      <header className="text-center pb-5">
        <h1 className="font-bold text-xl">Routine Around the Clock</h1>
        <p>
          Here you can create your routine with a visual tool that will help you
          get things done
        </p>
      </header>

      {routines?.length > 0 && (
        <SmartCircle routines={formatData(routines)}>TEST</SmartCircle>
      )}

      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(onSubmit)}>
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-row justify-between space-x-4">
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
          className="bg-cyan-200 p-4 rounded"
          type="button"
          onClick={() =>
            append({
              color: `#${getRandomColor()}`,
              fromTime:
                values?.length > 0 ? values[values.length - 1].toTime : "0",
              toTime:
                values?.length > 0
                  ? parseInt(values[values.length - 1].toTime) + 30
                  : "30",
              type: "Sleep"
            })
          }>
          Add a routine
        </button>
        <button className="px-5 py-3 bg-blue-400 rounded" type="submit">
          Create
        </button>
      </form>

      {/* <PieChart data={data} outerRadius={300} innerRadius={200} /> */}

      {/* <BarChart /> */}

      {/* <CircleProgressBar
        size={500}
        progressPercentage={55}
        progressColor="text-blue-400"
        circleBgColor="text-white"
      /> */}

      {/* <SimpleClock /> */}
    </div>
  );
}

export default App;
