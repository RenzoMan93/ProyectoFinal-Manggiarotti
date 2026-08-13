import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryChips from '../components/CategoryChips';
import EmptyState from '../components/EmptyState';
import SectionLabel from '../components/SectionLabel';
import TramiteCard from '../components/TramiteCard';
import { useBuscarTramites } from '../hooks/useBuscarTramites';
import { useCategorias } from '../hooks/useCategorias';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { COLORS, FONTS, MODALIDAD_LABEL } from '../lib/theme';

export default function SearchScreen({ navigation, route }) {
  const [texto, setTexto] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const debouncedTexto = useDebouncedValue(texto, 350);

  const { data: categorias = [] } = useCategorias();
  const { recientes, addRecent, clearRecent } = useRecentSearches();
  const {
    data: resultados = [],
    isLoading,
    isFetching,
  } = useBuscarTramites({ query: debouncedTexto, categoriaId });

  useEffect(() => {
    const inicial = route.params?.initialQuery;
    if (inicial) {
      setTexto(inicial);
      navigation.setParams({ initialQuery: undefined });
    }
  }, [route.params?.initialQuery]);

  useEffect(() => {
    if (debouncedTexto.trim().length >= 2) {
      addRecent(debouncedTexto.trim());
    }
  }, [debouncedTexto]);

  const hayFiltroActivo = debouncedTexto.trim().length > 0 || categoriaId !== null;
  const irAFicha = (tramiteId) => navigation.navigate('ProcedureDetail', { procedureId: tramiteId });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={[styles.searchBox, texto.length > 0 && styles.searchBoxActivo]}
            placeholder="Buscar: cédula, RUT, patente…"
            placeholderTextColor={COLORS.inkSoft}
            value={texto}
            onChangeText={setTexto}
          />
        </View>

        <CategoryChips categorias={categorias} selectedId={categoriaId} onSelect={setCategoriaId} />

        {hayFiltroActivo ? (
          <>
            <SectionLabel>
              {isLoading || isFetching
                ? 'Buscando…'
                : `${resultados.length} resultado${resultados.length === 1 ? '' : 's'}` +
                  (debouncedTexto.trim() ? ` para "${debouncedTexto.trim()}"` : '')}
            </SectionLabel>
            {isLoading ? (
              <ActivityIndicator color={COLORS.stamp} style={styles.loader} />
            ) : resultados.length > 0 ? (
              <View style={styles.list}>
                {resultados.map((tramite) => (
                  <TramiteCard
                    key={tramite.id}
                    nombre={tramite.nombre}
                    subtitulo={[tramite.organismo, MODALIDAD_LABEL[tramite.modalidad]]
                      .filter(Boolean)
                      .join(' · ')}
                    onPress={() => irAFicha(tramite.id)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No encontramos resultados"
                description="Probá con otra palabra o revisá otra categoría."
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.recentHeader}>
              <SectionLabel style={styles.recentLabel}>Búsquedas recientes</SectionLabel>
              {recientes.length > 0 && (
                <Pressable onPress={clearRecent} hitSlop={8}>
                  <Text style={styles.clearText}>Limpiar</Text>
                </Pressable>
              )}
            </View>
            {recientes.length > 0 ? (
              <View style={[styles.list, styles.recentList]}>
                {recientes.map((item) => (
                  <Pressable key={item} style={styles.recentRow} onPress={() => setTexto(item)}>
                    <Text style={styles.recentIcon}>⌕</Text>
                    <Text style={styles.recentText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                glyph="⌕"
                title="Todavía no buscaste nada"
                description="Escribí el nombre de un trámite u organismo para empezar."
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 32,
  },
  searchWrap: {
    marginHorizontal: 18,
    marginBottom: 6,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    fontSize: 14,
    color: COLORS.inkSoft,
  },
  searchBox: {
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 38,
    paddingRight: 14,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.ink,
  },
  searchBoxActivo: {
    borderColor: COLORS.ink,
  },
  list: {
    paddingHorizontal: 18,
    gap: 10,
  },
  recentList: {
    gap: 6,
  },
  loader: {
    marginTop: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 8,
  },
  recentLabel: {
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 0,
  },
  clearText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSoft,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  recentIcon: {
    fontSize: 13,
    color: COLORS.inkSoft,
    width: 20,
    textAlign: 'center',
  },
  recentText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.ink,
  },
});
