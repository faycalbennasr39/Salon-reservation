const API_CRENEAUX = 'https://faycalbennasr.app.n8n.cloud/webhook/creneaux';
const API_RESERVATION = 'https://faycalbennasr.app.n8n.cloud/webhook/2324c5c2-c8b3-40bb-a17b-62ccff5f269c';

let creneauxData = {};

async function chargerCreneaux() {
    try {
        const response = await fetch(API_CRENEAUX);
        const data = await response.json();
        creneauxData = data;
        
        afficherDates();
    } catch (error) {
        console.error('Erreur chargement créneaux:', error);
        document.getElementById('date').innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

function afficherDates() {
    const selectDate = document.getElementById('date');
    selectDate.innerHTML = '<option value="">-- Choisissez une date --</option>';
    
    const dates = Object.keys(creneauxData).sort();
    
    const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    dates.forEach(dateStr => {
        if (creneauxData[dateStr].length > 0) {
            const [annee, moisNum, jour] = dateStr.split('-');
            const date = new Date(annee, moisNum - 1, jour);
            const jourSemaine = joursSemaine[date.getDay()];
            const moisNom = mois[date.getMonth()];
            
            const option = document.createElement('option');
            option.value = dateStr;
            option.textContent = `${jourSemaine} ${jour} ${moisNom} ${annee}`;
            selectDate.appendChild(option);
        }
    });
}

function afficherHeures(dateSelectionnee) {
    const selectHeure = document.getElementById('heure');
    selectHeure.innerHTML = '';
    selectHeure.disabled = false;
    
    const creneaux = creneauxData[dateSelectionnee] || [];
    
    if (creneaux.length === 0) {
        selectHeure.innerHTML = '<option value="">Aucun créneau disponible</option>';
        selectHeure.disabled = true;
        return;
    }
    
    selectHeure.innerHTML = '<option value="">-- Choisissez une heure --</option>';
    
    creneaux.forEach(heure => {
        const option = document.createElement('option');
        option.value = heure;
        option.textContent = heure.replace(':', 'h');
        selectHeure.appendChild(option);
    });
}

document.getElementById('date').addEventListener('change', function() {
    const dateSelectionnee = this.value;
    if (dateSelectionnee) {
        afficherHeures(dateSelectionnee);
    } else {
        const selectHeure = document.getElementById('heure');
        selectHeure.innerHTML = '<option value="">-- Sélectionnez d\'abord une date --</option>';
        selectHeure.disabled = true;
    }
});

document.getElementById('reservationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const messageDiv = document.getElementById('message');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    messageDiv.style.display = 'none';
    
    const formData = {
        prenom: document.getElementById('prenom').value,
        nom: document.getElementById('nom').value,
        telephone: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        prestation: document.getElementById('prestation').value,
        date: document.getElementById('date').value,
        heure: document.getElementById('heure').value
    };
    
    try {
        const response = await fetch(API_RESERVATION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '✅ Votre rendez-vous a été confirmé ! Vous recevrez une confirmation par email.';
            messageDiv.style.display = 'block';
            
            document.getElementById('reservationForm').reset();
            document.getElementById('heure').disabled = true;
            document.getElementById('heure').innerHTML = '<option value="">-- Sélectionnez d\'abord une date --</option>';
            
            setTimeout(() => {
                chargerCreneaux();
            }, 2000);
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        console.error('Erreur:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = '❌ Une erreur est survenue. Veuillez réessayer.';
        messageDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
});

chargerCreneaux();
