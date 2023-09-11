import React, { useState } from 'react'
import { View } from 'react-native'
import { SearchBar } from 'react-native-elements'

const FullTextSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    // Добавьте здесь логику для выполнения поиска по `text`
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <SearchBar
        placeholder="Search"
        onChangeText={handleSearch}
        value={searchQuery}
      />
      {/* Вывод результатов поиска */}
    </View>
  )
}

export default FullTextSearch
