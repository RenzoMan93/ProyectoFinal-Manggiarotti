import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryChips from '../components/CategoryChips';
import EmptyState from '../components/EmptyState';
import SectionLabel from '../components/SectionLabel';
import TramiteCard from '../components/TramiteCard';
import { useCategorias } from '../hooks/useCategorias';
import { useSession } from '../hooks/useSession';
import { useTramitesDestacados } from '../hooks/useTramitesDestacados';
import { useTramitesEnCurso } from '../hooks/useTramitesEnCurso';
import { COLORS, FONTS, MODALIDAD_LABEL } from '../lib/theme';

export default function HomeScreen({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);

  const { usuario } = useSession();
  const { data: categorias = [] } = useCategorias();
  const { data: enCurso = [] } = useTramitesEnCurso(usuario?.id);
  const { data: destacados = [], isLoading: cargandoDestacados } = useTramitesDestacados(categoriaId);

  const nombre = usuario?.user_metadata?.full_name?.split(' ')[0] || usuario?.email?.split('@')[0];
  const saludo = nombre ? `Hola, ${nombre}` : 'Hola';

  const irAFicha = (tramiteId) => navigation.navigate('ProcedureDetail', { procedureId: tramiteId });

  const handleChangeBusqueda = (texto) => {
    setBusqueda(texto);
    if (texto.trim().length > 0) {
      navigation.navigate('Buscar', { initialQuery: texto });
      setBusqueda('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}>
          <Text style={styles.greet}>{saludo}</Text>
          <Text style={styles.heading}>¿Qué trámite necesitás resolver?</Text>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchBox}
            placeholder="Buscar: cédula, RUT, patente…"
            placeholderTextColor={COLORS.inkSoft}
            value={busqueda}
            onChangeText={handleChangeBusqueda}
          />
        </View>

        <CategoryChips categorias={categorias} selectedId={categoriaId} onSelect={setCategoriaId} />

        {enCurso.length > 0 && (
          <>
            <SectionLabel>En curso</SectionLabel>
            <View style={styles.list}>
              {enCurso.map((item) => {
                const total = item.tramite?.checklist_item?.[0]?.count ?? 0;
                const completados = Array.isArray(item.items_completados)
                  ? item.items_completados.length
                  : 0;
                return (
                  <TramiteCard
                    key={item.id}
                    nombre={item.tramite?.nombre ?? 'Trámite'}
                    subtitulo={total > 0 ? `${completados} de ${total} pasos completados` : 'En curso'}
                    onPress={() => navigation.navigate('Checklist', { procedureId: item.tramite?.id })}
                  />
                );
              })}
            </View>
          </>
        )}

        <SectionLabel>Más buscados</SectionLabel>
        {cargandoDestacados ? (
          <ActivityIndicator color={COLORS.stamp} style={styles.loader} />
        ) : destacados.length > 0 ? (
          <View style={styles.list}>
            {destacados.map((tramite) => (
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
            title="Todavía no hay trámites cargados"
            description={
              categoriaId ? 'Probá con otra categoría.' : 'Muy pronto vamos a sumar las primeras guías.'
            }
          />
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
    paddingBottom: 32,
  },
  topbar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
  },
  greet: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
    marginBottom: 2,
  },
  heading: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.ink,
  },
  searchWrap: {
    marginHorizontal: 18,
    marginTop: 14,
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
  list: {
    paddingHorizontal: 18,
    gap: 10,
  },
  loader: {
    marginTop: 16,
  },
});
