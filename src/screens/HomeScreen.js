// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../hooks/useUser';
import { useFeed } from '../hooks/useFeed';
import Header from '../components/common/Header';
import FeedItem from '../components/feed/FeedItem';
import Loading from '../components/common/Loading';
import { colors, spacing } from '../styles';

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const { feed, loading, refreshFeed } = useFeed();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadInitialFeed();
    }
  }, [user]);

  const loadInitialFeed = async () => {
    try {
      await refreshFeed();
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  };

  const renderFeedItem = ({ item }) => (
    <FeedItem 
      item={item} 
      onPress={() => navigation.navigate('StoryDetail', { story: item })}
    />
  );

  if (loading && !feed.length) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Glyffiti"
        rightAction={() => navigation.navigate('Profile')}
      />
      
      <FlatList
        data={feed}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  feedContainer: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.large,
  },
});

export default HomeScreen;