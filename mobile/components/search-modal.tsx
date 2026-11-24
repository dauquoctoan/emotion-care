import NativeGlassButton from '@/components/ui/native-glass-button';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
  onSearchSubmit?: (query: string) => void;
}

const SUGGESTED_TAGS = ['#chữalành', '#ngàymưa', '#tuổitrẻ', '#bìnhyên', '#côđơn', '#độclập'];

export default function SearchModal({
  visible,
  onClose,
  onSelectTag,
  onSearchSubmit,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  const handleDismiss = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleBackPress = () => {
    Haptics.selectionAsync();
    handleDismiss();
  };

  const handleTagPress = (tag: string) => {
    Haptics.selectionAsync();
    setQuery(tag);
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  const handleClear = () => {
    Haptics.selectionAsync();
    setQuery('');
  };

  const handleSubmit = () => {
    if (query.trim() && onSearchSubmit) {
      Haptics.selectionAsync();
      onSearchSubmit(query.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalWrapper}>
        {/* Full-screen backdrop: Tapping outside the card immediately closes the modal */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        {/* Search Modal Card on top */}
        <View style={styles.searchModalCard}>
          {/* Header Row: Back button < on the left + Search Input Bar */}
          <View style={styles.searchHeaderRow}>
            <NativeGlassButton
              onPress={handleBackPress}
              size={36}
              icon={<Ionicons name="chevron-back" size={20} color="#F8FAFC" />}
            />

            <View style={styles.searchInputRow}>
              <Ionicons name="search" size={17} color="#C084FC" />
              <TextInput
                style={styles.searchInputField}
                placeholder="Tìm câu từ, tâm trạng (k-NN search)..."
                placeholderTextColor="#64748B"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                autoFocus={true}
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Filter Tag Chips */}
          <View style={styles.suggestedKeywordsWrap}>
            <Text style={styles.suggestedTitle}>GỢI Ý TÌM KIẾM:</Text>
            <View style={styles.keywordChipsRow}>
              {SUGGESTED_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.keywordChip}
                  onPress={() => handleTagPress(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keywordChipText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* k-NN Semantic Search Indicator */}
          <View style={styles.searchResultMock}>
            <View style={styles.vectorBadge}>
              <Text style={styles.vectorBadgeText}>k-NN EMBEDDING</Text>
            </View>
            <Text style={styles.searchResultHint}>
              Hệ thống tìm kiếm thông minh theo trường ngữ nghĩa kết hợp Elasticsearch & Vector database.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 68 : 50,
    paddingHorizontal: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  searchModalCard: {
    backgroundColor: '#0E1017',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    gap: 14,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#161922',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInputField: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  suggestedKeywordsWrap: {
    gap: 8,
  },
  suggestedTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  keywordChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keywordChip: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.2)',
  },
  keywordChipText: {
    fontSize: 11,
    color: '#C084FC',
    fontWeight: '600',
  },
  searchResultMock: {
    paddingTop: 4,
    gap: 4,
  },
  vectorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  vectorBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  searchResultHint: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
