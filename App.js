import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import AsnyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto, AntDesign } from "@expo/vector-icons";

const TODO_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [change, setChange] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
    loadWorking();
  }, []);
  useEffect(() => {
    saveWorking();
  }, [working]);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const onChangeTodo = (payload) => setChange(payload);
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, finish: false, edit: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const editToDo = async (key) => {
    const newToDos = { ...toDos };
    const preWorking = newToDos[key].working;
    const preFinish = newToDos[key].finish;
    newToDos[key] = {
      text: change,
      working: preWorking,
      finish: preFinish,
      edit: false,
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setChange("");
  };
  const saveToDos = async (toSave) => {
    try {
      await AsnyncStorage.setItem(TODO_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
      return;
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsnyncStorage.getItem(TODO_KEY);
      if (s) {
        setToDos(JSON.parse(s));
      }
    } catch (e) {
      console.log(e);
      return;
    }
  };
  const delToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To DO", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "Sure",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const saveWorking = async () => {
    try {
      await AsnyncStorage.setItem(WORKING_KEY, JSON.stringify(working));
    } catch (e) {
      console.log(e);
      return;
    }
  };
  const loadWorking = async () => {
    try {
      const w = await AsnyncStorage.getItem(WORKING_KEY);
      setWorking(JSON.parse(w));
    } catch (e) {
      console.log(e);
      return;
    }
  };
  const cmpltToDo = async (key) => {
    const newToDos = { ...toDos };
    const preText = newToDos[key].text;
    const preWorking = newToDos[key].working;
    newToDos[key] = {
      text: preText,
      working: preWorking,
      finish: true,
      edit: false,
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const uncmpltToDo = async (key) => {
    const newToDos = { ...toDos };
    const preText = newToDos[key].text;
    const preWorking = newToDos[key].working;
    newToDos[key] = {
      text: preText,
      working: preWorking,
      finish: false,
      edit: false,
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const activateEdit = async (key) => {
    const newToDos = { ...toDos };
    const preText = newToDos[key].text;
    const preWorking = newToDos[key].working;
    const preFinish = newToDos[key].finish;
    newToDos[key] = {
      text: preText,
      working: preWorking,
      finish: preFinish,
      edit: true,
    };
    setToDos(newToDos);
    setChange(preText);
    await saveToDos(newToDos);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {toDos[key].edit ? (
                <TextInput
                  onSubmitEditing={() => editToDo(key)}
                  onChangeText={onChangeTodo}
                  returnKeyType="done"
                  placeholder={toDos[key].text}
                  value={change}
                  style={styles.edit}
                ></TextInput>
              ) : !toDos[key].finish ? (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              ) : (
                <Text style={styles.toDoTextCmplt}>{toDos[key].text}</Text>
              )}
              {toDos[key].edit ? null : (
                <View style={styles.toDoBtn}>
                  <TouchableOpacity onPress={() => activateEdit(key)}>
                    <AntDesign name="edit" size={24} color="white" />
                  </TouchableOpacity>
                  {!toDos[key].finish ? (
                    <TouchableOpacity onPress={() => cmpltToDo(key)}>
                      <Fontisto
                        name="checkbox-passive"
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => uncmpltToDo(key)}>
                      <Fontisto
                        name="checkbox-active"
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => delToDo(key)}>
                    <Fontisto name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoTextCmplt: {
    flex: 1,
    color: theme.gray,
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  toDoBtn: {
    flex: 0.6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  edit: {
    flex: 1,
  },
});
