import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}
const TodoScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const addTodo = () => {
    if (!input.trim()) return;

    // create new obj
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: input.trim(),
      completed: false,
      createdAt: new Date(),
    };

    // Add that obj in the Todos Array
    setTodos(prev => [...prev, newTodo]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const filterTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  const handleDeletePress = (id: string) => {
    // Make Modal visible when user presses delete todo item
    setModalVisible(true);
    setSelectedTodoId(id);
  };

  const confirmDelete = () => {
    if (!selectedTodoId) return;

    deleteTodo(selectedTodoId);
    setModalVisible(false);
    setSelectedTodoId(null);
  };

  const renderModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={modalVisible}
      // close the modal when user clicks outside the modal
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={{ fontSize: 16, marginVertical: 20 }}>
            Do you really want to delete this todo?
          </Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  backgroundColor: 'gray',
                  color: 'white',
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 7,
                  fontSize: 16,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} activeOpacity={0.7}>
              <Text
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 7,
                  fontSize: 16,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.headingText}>Todo Screen</Text>
        <View style={styles.todoContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Todo"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.todoButton} onPress={addTodo}>
            <Text style={styles.todoButtonText}>Add Todo</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filterTodos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Text
                onPress={() => toggleTodo(item.id)}
                style={[
                  styles.todoText,
                  item.completed && {
                    textDecorationLine: 'line-through',
                    color: 'gray',
                  },
                ]}
              >
                {item.title}
              </Text>

              <TouchableOpacity onPress={() => handleDeletePress(item.id)}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {modalVisible && renderModal()}
      </View>
    </SafeAreaView>
  );
};

export default TodoScreen;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   // alignItems: 'center',
  //   // width:'100%',
  //   // flexDirection:'column',
  //   // justifyContent:'center',
  //   backgroundColor: 'pink',
  // },
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
  headingText: {
    fontSize: 28,
    marginTop: 15,
    paddingVertical: 10,
    fontWeight: '700',
    color: 'white',
  },
  todoContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  todoButton: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  todoButtonText: {
    color: '#EBF4F6',
    fontWeight: '500',
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2, // Android shadow
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
});
