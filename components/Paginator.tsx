import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Picker,
  StyleSheet,
} from 'react-native'

interface PaginatorProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (newPage: number) => void
  onItemsPerPageChange: (newItemsPerPage: number) => void
}

const Paginator: React.FC<PaginatorProps> = ({
  totalItems,
  itemsPerPage,
  currentPage: initialCurrentPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    onItemsPerPageChange(newItemsPerPage)
    setCurrentPage(1) // Reset currentPage when itemsPerPage changes
  }

  const itemsPerPageOptions = [10, 20, 30, 50, 100] // Available items per page options

  const [currentPage, setCurrentPage] = useState(initialCurrentPage)
  const [previousPage, setPreviousPage] = useState(initialCurrentPage)
  const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(
    itemsPerPage.toString(),
  )

  useEffect(() => {
    setSelectedItemsPerPage(itemsPerPage.toString())
    setCurrentPage(initialCurrentPage)
  }, [itemsPerPage, initialCurrentPage])

  useEffect(() => {
    setPreviousPage(currentPage)
  }, [currentPage])

  return (
    <View style={styles.container}>
      <View style={styles.itemsPerPageContainer}>
        <Picker
          style={styles.itemsPerPagePicker}
          selectedValue={selectedItemsPerPage}
          onValueChange={(value) => {
            setSelectedItemsPerPage(value)
            handleItemsPerPageChange(Number(value))
            setCurrentPage(previousPage) // Restore previous currentPage value
          }}
        >
          {itemsPerPageOptions.map((option) => (
            <Picker.Item
              key={option}
              label={option.toString()}
              value={option.toString()}
            />
          ))}
        </Picker>
      </View>
      <View style={styles.paginationContainer}>
        <TouchableOpacity onPress={() => handlePageChange(currentPage - 1)}>
          <Text style={styles.button}>⬅</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.pageInput}
          value={currentPage.toString()}
          onChangeText={(text) => setCurrentPage(Number(text))}
          keyboardType="numeric"
        />
        <Text style={styles.pageText}>of {totalPages}</Text>
        <TouchableOpacity onPress={() => handlePageChange(currentPage + 1)}>
          <Text style={styles.button}>⮕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Spread components horizontally
    alignItems: 'center',
    marginTop: 10,
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    textAlign: 'right',
  },
  itemsPerPageText: {
    fontSize: 16,
    marginLeft: 10,
  },
  itemsPerPagePicker: {
    width: 80,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 5,
    margin: 5,
    backgroundColor: '#ff9f5a',
    color: 'black',
    borderRadius: 5,
  },
  pageInput: {
    width: 50,
    padding: 5,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  pageText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
})

export default Paginator
