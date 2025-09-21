// app/about/index.tsx
import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Linking,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Button,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Title, Paragraph } from 'react-native-paper';
import { usePathname } from 'expo-router';
import InstantSEO from '@/components/seo/InstantSEO';
import { sendFeedback } from '@/src/api/travels';
import {useIsFocused} from "@react-navigation/native/src";

const EMAIL = 'metraveldev@gmail.com';
const MAIL_SUBJECT = 'Info metravel.by';
const MAIL_BODY = 'Добрый день!';
const YT_URL = 'https://www.youtube.com/watch?v=K0oV4Y-i8hY';
const YT_THUMB = 'https://img.youtube.com/vi/K0oV4Y-i8hY/hqdefault.jpg';

export default function AboutAndContactScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const pathname = usePathname();
  const isFocused = useIsFocused();
  const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';
  // стабильный canonical и ключ для <head>
  const canonical = useMemo(() => `${SITE}/about`, [SITE]);

  // --- contact form state ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agree, setAgree] = useState(false);
  const [hp, setHp] = useState(''); // honeypot
  const [response, setResp] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; message?: boolean; agree?: boolean }>({});

  const emailRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const clearForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setAgree(false);
    setTouched({});
    setHp('');
  };

  const validate = () => {
    if (!name.trim() || !email.trim() || !message.trim()) return false;
    if (!isEmailValid(email)) return false;
    if (!agree) return false;
    return true;
  };

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, message: true, agree: true });
    if (hp.trim()) return;

    if (!name.trim() || !email.trim() || !message.trim())
      return setResp({ text: 'Заполните все поля.', error: true });
    if (!isEmailValid(email)) return setResp({ text: 'Введите корректный e-mail.', error: true });
    if (!agree) return setResp({ text: 'Требуется согласие на обработку данных.', error: true });

    try {
      setSending(true);
      const res = await sendFeedback(name.trim(), email.trim(), message.trim());
      setResp({ text: res, error: false });
      clearForm();
    } catch (e: any) {
      setResp({ text: e?.message || 'Не удалось отправить сообщение.', error: true });
    } finally {
      setSending(false);
    }
  };

  const handleWebKeyPress = (e: any) => {
    if (Platform.OS !== 'web') return;
    if (e?.nativeEvent?.key === 'Enter' && !e?.shiftKey) {
      e.preventDefault?.();
      handleSubmit();
    }
  };

  const sendMail = useCallback(() => {
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;
    Linking.canOpenURL(url).then((supported) => supported && Linking.openURL(url)).catch(() => {});
  }, []);

  const openYoutube = useCallback(() => {
    Linking.openURL(YT_URL).catch(() => {});
  }, []);

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  const invalidName = touched.name && !name.trim();
  const invalidEmail = touched.email && (!email.trim() || !isEmailValid(email));
  const invalidMessage = touched.message && !message.trim();
  const invalidAgree = touched.agree && !agree;
  const isDisabled = sending || !validate();

  const title = 'О проекте MeTravel | Кто мы и зачем это всё';
  const description =
      'Проект MeTravel — сообщество путешественников. Делитесь маршрутами, пишите статьи, вдохновляйтесь идеями!';

  return (
      <>
        {isFocused && (
        <InstantSEO
            headKey="about"           // фиксированный ключ страницы
            title={title}
            description={description}
            canonical={canonical}
            image={`${SITE}/og-preview.jpg`}
            ogType="website"
        />
        )}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <ImageBackground
                source={require('@/assets/images/media/slider/about.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
                // @ts-ignore RN web поддерживает fetchPriority
                fetchpriority="high"
            >
              <View style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.content}>
                  <Title style={styles.title}>MeTravel.by</Title>

                  <View style={isWide ? styles.twoColumns : styles.oneColumn}>
                    <View style={isWide ? styles.column : null}>
                      <Paragraph style={styles.paragraph}>MeTravel.by – это некоммерческий проект для путешественников.</Paragraph>

                      <Paragraph style={styles.paragraph}>Чтобы поделиться своими путешествиями:</Paragraph>

                      <View style={styles.list}>
                        <Text style={styles.listItem}>1) Регистрируемся</Text>
                        <Text style={styles.listItem}>2) Добавляем своё путешествие</Text>
                        <Text style={styles.listItem}>3) Ставим статус «Опубликовать»</Text>
                        <Text style={styles.listItem}>4) Ждём модерации (до 24 часов)</Text>
                        <Text style={styles.listItem}>5) Хотите в Instagram? Напишите в директ @metravelby</Text>
                      </View>

                      <Paragraph style={styles.paragraph}>
                        Проект запущен в июне 2020. Использование материалов — только с разрешения автора. Идеи, отзывы и предложения присылайте на:
                      </Paragraph>

                      <TouchableOpacity
                          onPress={sendMail}
                          accessibilityRole="button"
                          accessibilityLabel="Написать на электронную почту"
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.link}>{EMAIL}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[isWide ? styles.column : null, !isWide && styles.videoColumnMobile]}>
                      <TouchableOpacity
                          onPress={openYoutube}
                          style={[styles.videoCard, isWide && styles.videoCardRow]}
                          accessibilityRole="button"
                          accessibilityLabel="Смотреть инструкцию на YouTube"
                          activeOpacity={0.85}
                      >
                        <View style={[styles.videoThumbWrap, !isWide && styles.videoThumbWrapMobile]}>
                          <ImageBackground
                              source={{ uri: YT_THUMB }}
                              style={styles.videoThumb}
                              imageStyle={styles.videoThumbImage}
                              resizeMode="cover"
                          >
                            <View style={styles.playBadge}>
                              <Text style={styles.playIcon}>▶</Text>
                            </View>
                          </ImageBackground>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ===== Связаться с нами ===== */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Связаться с нами</Text>

                    <View style={styles.form}>
                      {response.text !== '' && (
                          <Text role="alert" aria-live="polite" style={[styles.response, response.error ? styles.err : styles.ok]}>
                            {response.text}
                          </Text>
                      )}

                      {/* honeypot */}
                      <TextInput
                          style={styles.honeypot}
                          value={hp}
                          onChangeText={setHp}
                          accessibilityElementsHidden
                          importantForAccessibility="no-hide-descendants"
                          placeholder="Do not fill"
                      />

                      <TextInput
                          style={[styles.input, invalidName && styles.inputErr]}
                          placeholder="Имя"
                          value={name}
                          onChangeText={setName}
                          returnKeyType="next"
                          onBlur={() => setTouched((s) => ({ ...s, name: true }))}
                          onSubmitEditing={() => emailRef.current?.focus()}
                      />
                      {invalidName && <Text style={styles.fieldErr}>Укажите имя</Text>}

                      <TextInput
                          ref={emailRef}
                          style={[styles.input, invalidEmail && styles.inputErr]}
                          placeholder="Email"
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          returnKeyType="next"
                          onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                          onSubmitEditing={() => messageRef.current?.focus()}
                      />
                      {invalidEmail && <Text style={styles.fieldErr}>Неверный e-mail</Text>}

                      <TextInput
                          ref={messageRef}
                          style={[styles.input, styles.message, invalidMessage && styles.inputErr]}
                          placeholder="Сообщение"
                          value={message}
                          onChangeText={setMessage}
                          multiline
                          blurOnSubmit={false}
                          onKeyPress={handleWebKeyPress}
                          onSubmitEditing={Platform.OS !== 'web' ? () => handleSubmit() : undefined}
                          onBlur={() => setTouched((s) => ({ ...s, message: true }))}
                      />
                      {invalidMessage && <Text style={styles.fieldErr}>Напишите сообщение</Text>}

                      <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setAgree(!agree);
                            setTouched((s) => ({ ...s, agree: true }));
                          }}
                          style={styles.agreeRow}
                      >
                        <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                          {agree ? <Text style={styles.checkboxMark}>✓</Text> : null}
                        </View>
                        <Text style={[styles.agreeLabel, invalidAgree && styles.fieldErr]}>
                          Согласен(на) на обработку персональных данных
                        </Text>
                      </TouchableOpacity>
                      {invalidAgree && <Text style={styles.fieldErr}>Нужно согласие</Text>}

                      <Button color="#6AAAAA" title={sending ? 'Отправка…' : 'Отправить'} onPress={handleSubmit} disabled={isDisabled} />
                    </View>
                  </View>

                  <View style={styles.contactsCard}>
                    <View style={styles.links}>
                      <TouchableOpacity onPress={() => openUrl('https://instagram.com/metravelby')}>
                        <Text style={styles.link}>Instagram: @metravelby</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  content: {
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16, color: '#333', textAlign: 'center' },
  paragraph: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 10 },
  list: { marginBottom: 10 },
  listItem: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 4 },
  link: { color: '#2c7a7b', fontSize: 16, marginTop: 10, textDecorationLine: 'underline' },
  twoColumns: { flexDirection: 'row', justifyContent: 'space-between', gap: 30 },
  oneColumn: { flexDirection: 'column', gap: 16 },
  column: { flex: 1 },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 16,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  videoCardRow: { flexDirection: 'row', alignItems: 'stretch' },
  videoThumbWrap: { width: 200, alignItems: 'center', justifyContent: 'center' },
  videoThumbWrapMobile: { width: '100%' },
  videoThumb: { width: '100%', aspectRatio: 9 / 16, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  videoThumbImage: { width: '100%', height: '100%' },
  playBadge: { width: 64, height: 64, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  playIcon: { color: '#fff', fontSize: 28, marginLeft: 4 },
  videoMeta: { flex: 1, paddingHorizontal: 20, paddingVertical: 16, justifyContent: 'center', gap: 6 },
  videoTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  videoSubtitle: { fontSize: 14, color: '#4a5568' },
  videoColumnMobile: { marginTop: 16, width: '100%', alignSelf: 'stretch' },
  section: { marginTop: 24, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#333', textAlign: 'center' },
  contactsCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: 16, alignItems: 'flex-start', gap: 8 },
  links: { gap: 6 },
  form: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  input: { padding: 10, marginVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff' },
  inputErr: { borderColor: '#d32f2f' },
  message: { height: 100, textAlignVertical: 'top' },
  response: { textAlign: 'center', marginBottom: 15, fontSize: 16 },
  fieldErr: { color: '#d32f2f', marginTop: -6, marginBottom: 8 },
  err: { color: '#d32f2f' },
  ok: { color: '#2e7d32' },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#6AAAAA', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#6AAAAA' },
  checkboxMark: { color: '#fff', fontSize: 14, lineHeight: 16 },
  agreeLabel: { flex: 1, color: '#333' },
  honeypot: { height: 0, opacity: 0, padding: 0, margin: 0 },
});
