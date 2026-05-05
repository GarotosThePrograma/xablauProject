const API_URL = 'http://localhost:5002/api'

async function getErrorMessage(response, fallbackMessage) {
  const message = await response.text()
  return message || fallbackMessage
}

export async function getProducts() {
  const response = await fetch(`${API_URL}/produtos`)

  if(!response.ok) {
    throw new Error('Erro ao buscar produtos')
  }

  return await response.json()
}

export async function getProductById(productId) {
  const response = await fetch(`${API_URL}/produtos/${productId}`)

  if(!response.ok) {
    throw new Error('Erro ao buscar produto')
  }

  return await response.json()
}

export async function createProduct(product) {
  const response = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: product.name,
      descricao: product.name,
      preco: Number(product.price),
      estoque: Number(product.stock),
      imagemUrl: product.img,
    }),
  })

  if(!response.ok) {
    throw new Error(await getErrorMessage(response, 'Erro ao criar produto'))
  }

  return await response.json()
}

export async function updateProductStock(productId, stock) {
  const response = await fetch(`${API_URL}/produtos/${productId}/estoque`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estoque: Number(stock),
    }),
  })

  if(!response.ok) {
    throw new Error(await getErrorMessage(response, 'Erro ao atualizar estoque'))
  }

  return await response.json()
}

export async function updateProduct(productId, product) {
  const response = await fetch(`${API_URL}/produtos/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: product.name,
      descricao: product.name,
      preco: Number(product.price),
      estoque: Number(product.stock),
      imagemUrl: product.img,
    }),
  })

  if(!response.ok) {
    throw new Error(await getErrorMessage(response, 'Erro ao atualizar produto'))
  }

  return await response.json()
}

export async function deleteProduct(productId) {
  const response = await fetch(`${API_URL}/produtos/${productId}`, {
    method: 'DELETE',
  })

  if(!response.ok) {
    throw new Error('Erro ao deletar produto')
  }
}
