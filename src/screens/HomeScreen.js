// src/screens/HomeScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { homeStyles } from '../styles/homeStyles';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const handlePublishing = () => {
    navigation?.navigate('Publishing');
  };

  const handlePlaceholderPress = (feature) => {
    // Placeholder for future features
    console.log(`${feature} pressed - coming soon!`);
  };

  return (
    <SafeAreaView style={homeStyles.container}>
      <ScrollView 
        contentContainerStyle={homeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={homeStyles.header}>
          <Text style={homeStyles.appTitle}>Glyffiti</Text>
          <Text style={homeStyles.tagline}>Decentralized storytelling on Solana</Text>
        </View>

        {/* Main Action Section */}
        <View style={homeStyles.mainSection}>
          <Text style={homeStyles.sectionTitle}>What would you like to do?</Text>
          
          {/* Publishing Button - Main Feature */}
          <TouchableOpacity 
            style={homeStyles.primaryButton}
            onPress={handlePublishing}
            activeOpacity={0.7}
          >
            <Text style={homeStyles.primaryButtonIcon}>📤</Text>
            <View style={homeStyles.primaryButtonContent}>
              <Text style={homeStyles.primaryButtonTitle}>Publishing</Text>
              <Text style={homeStyles.primaryButtonSubtitle}>
                Write and publish your stories to the blockchain
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions - Placeholders */}
        <View style={homeStyles.secondarySection}>
          <Text style={homeStyles.sectionTitle}>Explore</Text>
          
          <View style={homeStyles.buttonRow}>
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Library')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>📚</Text>
              <Text style={homeStyles.secondaryButtonText}>Library</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Discover')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>🔍</Text>
              <Text style={homeStyles.secondaryButtonText}>Discover</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
          
          <View style={homeStyles.buttonRow}>
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Community')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>👥</Text>
              <Text style={homeStyles.secondaryButtonText}>Community</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Profile')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>👤</Text>
              <Text style={homeStyles.secondaryButtonText}>Profile</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={homeStyles.footer}>
          <Text style={homeStyles.footerText}>
            Secure • Decentralized • Permanent
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// Character count: 3012