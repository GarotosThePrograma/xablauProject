const API_URL = 'http://localhost:5002/api'

export async function getProducts() {
  const response = await fetch(`${API_URL}/produtos`)

  if(!response.ok) {
    throw new Error('Erro ao buscar produtos')
  }

  return await response.json()
}