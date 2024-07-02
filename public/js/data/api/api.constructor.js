export async function convertResponseToJson(response) {
  return (
    await response.json()
  );
}

export async function signin(authData) {
  return (
    await fetch('http://localhost:5000/auth/signin', {
      method: 'POST',
      body: JSON.stringify(authData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
}

export async function getUserAuthData() {
  return (
    await fetch("http://localhost:5000/auth")
  );
}

export async function getAllUsers(searchString = '') {
  return (
    await fetch(`http://localhost:5000/api/users/admin?search=${searchString}`)
  );
}

export async function getUserPosts() {
  return (
    await fetch("http://localhost:5000/api/posts/public")
  );
}

export function isStatusOk(response) {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
