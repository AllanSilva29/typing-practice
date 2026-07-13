async function fetchAllData(urls) {
  const promises = urls.map(url => fetch(url).then(res => res.json()));
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Erro na busca de dados", error);
    throw error;
  }
}
