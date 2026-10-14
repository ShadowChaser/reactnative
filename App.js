import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@little-lemon/profile-v1';
const C = { green: '#495E57', dark: '#25302D', lemon: '#F4CE14', pale: '#F5F6F4', gray: '#6B756F', line: '#E2E6E3', white: '#FFFFFF' };

const dishes = [
  { name: 'Greek Salad', category: 'Starters', description: 'Crisp lettuce, peppers, olives and feta with our house dressing.', price: '$12.99', art: 'ðŸ¥—', color: '#E7F0D9' },
  { name: 'Bruschetta', category: 'Starters', description: 'Grilled bread, ripe tomatoes, basil and a little garlic.', price: '$7.99', art: 'ðŸ…', color: '#F8E8DB' },
  { name: 'Grilled Fish', category: 'Mains', description: 'Catch of the day with lemon, herbs and seasonal vegetables.', price: '$20.00', art: 'ðŸŸ', color: '#DCEBE7' },
  { name: 'Pasta Primavera', category: 'Mains', description: 'Fresh pasta tossed with garden vegetables and parmesan.', price: '$18.99', art: 'ðŸ', color: '#F5EBD2' },
  { name: 'Lemon Dessert', category: 'Desserts', description: 'A light lemon and ricotta cake finished with citrus zest.', price: '$6.99', art: 'ðŸ°', color: '#FBEDB7' },
  { name: 'Mint Lemonade', category: 'Drinks', description: 'Freshly squeezed lemons, mint and sparkling water.', price: '$4.50', art: 'ðŸ‹', color: '#E7F0D9' },
];
const categories = ['Starters', 'Mains', 'Desserts', 'Drinks'];
const emptyProfile = { firstName: '', lastName: '', email: '', phone: '', notifications: true };

function Brand({ subtitle }) {
  return <View style={styles.brand}><Text style={styles.brandFruit}>ðŸ‹</Text><Text style={styles.brandName}>LITTLE LEMON</Text>{subtitle ? <Text style={styles.brandSub}>{subtitle}</Text> : null}</View>;
}

function Header({ onBack, onProfile, title }) {
  return <View style={styles.header}>
    {onBack ? <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" style={styles.headerButton}><Text style={styles.backArrow}>â€¹</Text></Pressable> : <View style={styles.headerSpacer} />}
    <Brand subtitle={title} />
    {onProfile ? <Pressable onPress={onProfile} accessibilityRole="button" accessibilityLabel="Open profile" style={styles.avatar}><Text style={styles.avatarText}>ðŸ‘¤</Text></Pressable> : <View style={styles.headerSpacer} />}
  </View>;
}

function Hero() {
  return <View style={styles.hero}>
    <View style={styles.heroCopy}><Text style={styles.heroTitle}>Little Lemon</Text><Text style={styles.heroCity}>Chicago</Text><Text style={styles.heroDescription}>We are a family owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.</Text></View>
    <View style={styles.heroPlate}><Text style={styles.heroFood}>ðŸ¢</Text><Text style={styles.heroFoodCaption}>FRESH DAILY</Text></View>
  </View>;
}

function DishRow({ dish }) {
  return <View style={styles.dishRow}>
    <View style={styles.dishCopy}><Text style={styles.dishName}>{dish.name}</Text><Text style={styles.dishDescription} numberOfLines={2}>{dish.description}</Text><Text style={styles.dishPrice}>{dish.price}</Text></View>
    <View style={[styles.dishArt, { backgroundColor: dish.color }]}><Text style={styles.dishEmoji}>{dish.art}</Text></View>
  </View>;
}

function App() {
  const [screen, setScreen] = useState('loading');
  const [stack, setStack] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) {
        const saved = { ...emptyProfile, ...JSON.parse(value) };
        setProfile(saved); setDraft(saved); setScreen('home');
      } else setScreen('onboarding');
    }).catch(() => setScreen('onboarding'));
  }, []);

  const navigate = (next) => { setStack((previous) => [...previous, screen]); setScreen(next); };
  const goBack = () => {
    if (!stack.length) return false;
    setScreen(stack[stack.length - 1]); setStack((previous) => previous.slice(0, -1)); return true;
  };
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => listener.remove();
  }, [stack, screen]);

  const validEmail = /^\S+@\S+\.\S+$/.test(draft.email.trim());
  const canContinue = draft.firstName.trim().length > 0 && validEmail;
  const visibleDishes = useMemo(() => dishes.filter((dish) => (category === 'All' || dish.category === category) && `${dish.name} ${dish.description}`.toLowerCase().includes(search.trim().toLowerCase())), [category, search]);

  const finishOnboarding = async () => {
    if (!canContinue || saving) return;
    const saved = { ...draft, firstName: draft.firstName.trim(), email: draft.email.trim() };
    setSaving(true);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); setProfile(saved); setDraft(saved); setStack([]); setScreen('home'); }
    catch { Alert.alert('Could not save', 'Please try again.'); }
    finally { setSaving(false); }
  };
  const saveProfile = async () => {
    if (saving) return;
    const saved = { ...draft, firstName: draft.firstName.trim(), lastName: draft.lastName.trim(), email: draft.email.trim(), phone: draft.phone.trim() };
    setSaving(true);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); setProfile(saved); goBack(); }
    catch { Alert.alert('Could not save', 'Please try again.'); }
    finally { setSaving(false); }
  };
  const logout = () => Alert.alert('Log out?', 'Your saved profile will be cleared from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: async () => { await AsyncStorage.removeItem(STORAGE_KEY); setProfile(emptyProfile); setDraft(emptyProfile); setStack([]); setScreen('onboarding'); } },
  ]);

  if (screen === 'loading') return <SafeAreaView style={styles.loading}><Text style={styles.loadingLemon}>ðŸ‹</Text><Text style={styles.loadingText}>LITTLE LEMON</Text></SafeAreaView>;

  if (screen === 'onboarding') return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" /><Header /><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.onboardContent} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>WELCOME TO</Text><Hero />
    <Text style={styles.formTitle}>Letâ€™s get to know you</Text><Text style={styles.formHint}>Enter your details to start exploring the menu.</Text>
    <Field label="First name *" value={draft.firstName} onChangeText={(v) => setDraft({ ...draft, firstName: v })} placeholder="Your first name" autoCapitalize="words" />
    <Field label="Last name" value={draft.lastName} onChangeText={(v) => setDraft({ ...draft, lastName: v })} placeholder="Your last name" autoCapitalize="words" />
    <Field label="Email address *" value={draft.email} onChangeText={(v) => setDraft({ ...draft, email: v })} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
    <Pressable disabled={!canContinue || saving} onPress={finishOnboarding} style={[styles.primaryButton, (!canContinue || saving) && styles.disabledButton]}><Text style={[styles.primaryButtonText, (!canContinue || saving) && styles.disabledButtonText]}>{saving ? 'Savingâ€¦' : 'Next'}</Text></Pressable>
    <Text style={styles.privacyNote}>Your details stay on this device.</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;

  if (screen === 'profile') return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" /><Header onBack={goBack} title="PROFILE" />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.profileContent} keyboardShouldPersistTaps="handled">
      <View style={styles.profileIntro}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(draft.firstName[0] || 'L').toUpperCase()}</Text></View><View style={styles.profileIntroCopy}><Text style={styles.profileHeading}>Personal information</Text><Text style={styles.profileSubheading}>Manage your account details</Text></View></View>
      <Field label="First name" value={draft.firstName} onChangeText={(v) => setDraft({ ...draft, firstName: v })} autoCapitalize="words" />
      <Field label="Last name" value={draft.lastName} onChangeText={(v) => setDraft({ ...draft, lastName: v })} autoCapitalize="words" />
      <Field label="Email address" value={draft.email} onChangeText={(v) => setDraft({ ...draft, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone number" value={draft.phone} onChangeText={(v) => setDraft({ ...draft, phone: v })} placeholder="Add a phone number" keyboardType="phone-pad" />
      <Text style={styles.sectionTitle}>Email notifications</Text><Pressable onPress={() => setDraft({ ...draft, notifications: !draft.notifications })} style={styles.checkRow}><View style={[styles.checkbox, draft.notifications && styles.checkboxActive]}><Text style={styles.checkmark}>{draft.notifications ? 'âœ“' : ''}</Text></View><Text style={styles.checkLabel}>Restaurant news and special offers</Text></Pressable>
      <Pressable onPress={logout} style={styles.logoutButton}><Text style={styles.logoutText}>Log out</Text></Pressable>
      <View style={styles.profileActions}><Pressable onPress={() => { setDraft(profile); goBack(); }} style={styles.secondaryButton}><Text style={styles.secondaryText}>Discard</Text></Pressable><Pressable onPress={saveProfile} style={[styles.primaryButton, styles.saveButton]}><Text style={styles.primaryButtonText}>{saving ? 'Savingâ€¦' : 'Save changes'}</Text></Pressable></View>
    </ScrollView></KeyboardAvoidingView></SafeAreaView>;

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" /><Header onProfile={() => { setDraft(profile); navigate('profile'); }} />
    <ScrollView contentContainerStyle={styles.homeContent} keyboardShouldPersistTaps="handled">
      <Hero />
      <View style={styles.searchWrap}><Text style={styles.searchIcon}>âŒ•</Text><TextInput style={styles.searchInput} placeholder="Search dishes" placeholderTextColor="#8B948F" value={search} onChangeText={setSearch} accessibilityLabel="Search menu" /></View>
      <View style={styles.menuSection}><Text style={styles.sectionTitle}>ORDER FOR DELIVERY</Text><Text style={styles.menuSub}>Explore the menu</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>{['All', ...categories].map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryPill, category === item && styles.categorySelected]}><Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text></Pressable>)}</ScrollView>
      </View>
      <View style={styles.foodList}>{visibleDishes.length ? visibleDishes.map((dish) => <DishRow key={dish.name} dish={dish} />) : <Text style={styles.emptyText}>No dishes found. Try another search.</Text>}</View>
      <Text style={styles.footer}>Made with care in Chicago Â· Little Lemon</Text>
    </ScrollView>
  </SafeAreaView>;
}

function Field({ label, ...props }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#969E99" /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white }, flex: { flex: 1 }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.white }, loadingLemon: { fontSize: 42 }, loadingText: { marginTop: 8, color: C.green, fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  header: { height: 66, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F2F1' }, headerSpacer: { width: 42 }, headerButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' }, backArrow: { fontSize: 34, lineHeight: 38, color: C.white, marginTop: -3 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 7 }, brandFruit: { fontSize: 19 }, brandName: { color: C.green, fontSize: 12, fontWeight: '900', letterSpacing: 2 }, brandSub: { display: 'none' }, avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E7ECE9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.white }, avatarText: { fontSize: 19 },
  onboardContent: { paddingHorizontal: 22, paddingBottom: 32 }, eyebrow: { color: C.gray, fontSize: 11, letterSpacing: 2, fontWeight: '800', marginTop: 20, marginBottom: 10 }, hero: { minHeight: 186, backgroundColor: C.green, padding: 20, flexDirection: 'row', alignItems: 'center', borderRadius: 16, overflow: 'hidden' }, heroCopy: { flex: 1, paddingRight: 8 }, heroTitle: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.lemon, fontSize: 31, fontWeight: 'bold' }, heroCity: { color: C.white, fontSize: 19, fontWeight: '700', marginTop: -2 }, heroDescription: { color: '#F3F4F2', fontSize: 13, lineHeight: 18, marginTop: 12, maxWidth: 240 }, heroPlate: { width: 84, height: 102, borderRadius: 16, backgroundColor: '#F1D88C', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '4deg' }] }, heroFood: { fontSize: 40 }, heroFoodCaption: { color: C.green, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  formTitle: { fontSize: 22, color: C.dark, fontWeight: '800', marginTop: 27 }, formHint: { color: C.gray, fontSize: 13, marginTop: 5, marginBottom: 16 }, field: { marginTop: 15 }, fieldLabel: { fontSize: 13, fontWeight: '700', color: '#48534D', marginBottom: 8 }, input: { borderWidth: 1, borderColor: '#CDD4D0', height: 50, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: C.dark, backgroundColor: C.white }, primaryButton: { marginTop: 23, minHeight: 52, borderRadius: 10, backgroundColor: C.lemon, alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#1E2823', fontSize: 15, fontWeight: '800' }, disabledButton: { backgroundColor: '#E7E9E7' }, disabledButtonText: { color: '#A0A6A2' }, privacyNote: { textAlign: 'center', color: '#858E89', marginTop: 13, fontSize: 12 },
  homeContent: { paddingBottom: 30 }, searchWrap: { marginHorizontal: 20, marginTop: 16, height: 48, borderRadius: 12, backgroundColor: C.pale, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: '#EEF0EE' }, searchIcon: { fontSize: 29, color: C.green, marginRight: 9, lineHeight: 34 }, searchInput: { flex: 1, color: C.dark, fontSize: 14 }, menuSection: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 16 }, sectionTitle: { color: C.dark, fontWeight: '900', fontSize: 14, letterSpacing: 0.6 }, menuSub: { color: C.gray, fontSize: 12, marginTop: 4 }, categoryList: { gap: 9, paddingTop: 14, paddingBottom: 2 }, categoryPill: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 24, backgroundColor: '#F0F2F0' }, categorySelected: { backgroundColor: C.green }, categoryText: { color: C.green, fontWeight: '700', fontSize: 12 }, categoryTextSelected: { color: C.white }, foodList: { marginHorizontal: 20, borderTopWidth: 1, borderColor: C.line }, dishRow: { minHeight: 106, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: C.line, gap: 12 }, dishCopy: { flex: 1 }, dishName: { color: C.dark, fontSize: 14, fontWeight: '800' }, dishDescription: { color: C.gray, fontSize: 11, lineHeight: 16, marginTop: 5 }, dishPrice: { color: C.green, fontWeight: '800', fontSize: 12, marginTop: 7 }, dishArt: { width: 72, height: 72, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, dishEmoji: { fontSize: 34 }, emptyText: { color: C.gray, paddingVertical: 28, textAlign: 'center', fontSize: 13 }, footer: { textAlign: 'center', marginTop: 22, color: '#89928D', fontSize: 11 },
  profileContent: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 36 }, profileIntro: { flexDirection: 'row', alignItems: 'center', marginBottom: 11, gap: 13 }, profileAvatar: { width: 55, height: 55, borderRadius: 28, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' }, profileAvatarText: { color: C.lemon, fontSize: 24, fontWeight: '800' }, profileIntroCopy: { flex: 1 }, profileHeading: { color: C.dark, fontSize: 19, fontWeight: '800' }, profileSubheading: { color: C.gray, fontSize: 12, marginTop: 4 }, sectionTitle: { color: C.dark, fontWeight: '900', fontSize: 14, letterSpacing: 0.6 }, checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 11 }, checkbox: { width: 22, height: 22, borderWidth: 1.5, borderColor: '#9BA49F', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }, checkboxActive: { backgroundColor: C.green, borderColor: C.green }, checkmark: { color: C.white, fontSize: 15, fontWeight: '900', lineHeight: 18 }, checkLabel: { color: '#59645E', fontSize: 13 }, logoutButton: { marginTop: 27, height: 50, borderRadius: 10, backgroundColor: C.lemon, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: '#222B25', fontWeight: '900', fontSize: 14 }, profileActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 11, marginTop: 15 }, secondaryButton: { height: 48, paddingHorizontal: 17, borderRadius: 9, borderWidth: 1, borderColor: C.green, alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: C.green, fontSize: 13, fontWeight: '700' }, saveButton: { marginTop: 0, paddingHorizontal: 18, minHeight: 48, backgroundColor: C.green }, saveButtonText: { color: C.white },
});

export default App;

