const PASSWORD_HASHES = {
    'motdepasse1': '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', // mdp: admin123
    'motdepasse2': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // mdp: secret456
    'motdepasse3': 'e4da3b7fbbce2345d7772b0674a318d149100219512f428e', // mdp: prive789
};

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    const error = document.getElementById('error');
    
    // Hash du mot de passe (SHA256 simplifié côté client)
    const hash = await sha256(password);
    
    btn.innerHTML = '<span class="loading"></span> Vérification...';
    btn.disabled = true;
    error.classList.add('hidden');
    
    // Vérification
    if (PASSWORD_HASHES[hash]) {
        // Stockage sécurisé du token
        localStorage.setItem('accessToken', hash);
        window.location.href = 'upload.html';
    } else {
        error.textContent = '❌ Mot de passe incorrect';
        error.classList.remove('hidden');
        btn.innerHTML = 'Accéder';
        btn.disabled = false;
    }
});

// Fonction hash SHA256 (polyfill)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Vérification auto de l'accès
if (localStorage.getItem('accessToken') && 
    PASSWORD_HASHES[localStorage.getItem('accessToken')]) {
    window.location.href = 'upload.html';
}
