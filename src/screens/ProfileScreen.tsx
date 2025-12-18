import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { authService, supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { AnimatedButton } from '../components/TouchableScale';

interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  gender?: string;
  age_range?: string;
  skin_type?: string;
  skin_tone?: string;
  is_pregnant?: boolean;
  created_at?: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load profile from cosme_users
        const { data, error } = await supabase
          .from('cosme_users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.authPrompt}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={styles.title}>Мой профиль</Text>
            <Text style={styles.description}>
              Войдите, чтобы получить доступ к персональным рекомендациям и сохранить историю поиска
            </Text>
            <AnimatedButton
              title="Войти или зарегистрироваться"
              onPress={() => navigation.navigate('Login')}
            />
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Возможности профиля:</Text>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✨</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Персональные рекомендации</Text>
                <Text style={styles.featureDescription}>
                  Получайте подборки продуктов по вашему типу кожи
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📋</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>История поиска</Text>
                <Text style={styles.featureDescription}>
                  Сохраняйте и просматривайте проверенные продукты
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>❤️</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Избранное</Text>
                <Text style={styles.featureDescription}>
                  Создавайте списки любимых продуктов
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔔</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Уведомления</Text>
                <Text style={styles.featureDescription}>
                  Узнавайте о новых продуктах и обновлениях
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.email?.[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.email}</Text>
          <Text style={styles.userEmail}>Участник с {new Date(user.created_at).getFullYear()}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuText}>Редактировать профиль</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🧴</Text>
            <Text style={styles.menuText}>Тип кожи и предпочтения</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>История поиска</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❤️</Text>
            <Text style={styles.menuText}>Избранное</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Настройки</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signOutContainer}>
          <AnimatedButton title="Выйти" onPress={handleSignOut} variant="outline" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  authPrompt: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    marginTop: SPACING.lg,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.gray4,
    lineHeight: 18,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray4,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.gray4,
  },
  signOutContainer: {
    marginTop: SPACING.lg,
  },
});
