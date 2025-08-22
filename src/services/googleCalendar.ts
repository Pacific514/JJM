
import axios from 'axios';

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
}

class GoogleCalendarService {
  private accessToken: string = '';
  private calendarId: string = 'primary';
  private companyName: string = 'JJ Mécanique';
  
  // Heures d'ouverture strictes : 8h00 à 18h00, 7 jours sur 7
  private businessHours = {
    start: 8,  // 8h00
    end: 18,   // 18h00
    days: [0, 1, 2, 3, 4, 5, 6] // Dimanche à samedi (0 = dimanche)
  };

  // Créneaux de 3 heures respectant les heures d'ouverture (8h-18h)
  private timeSlots = [
    { start: 8, end: 11 },   // 8h00 - 11h00
    { start: 11, end: 14 },  // 11h00 - 14h00
    { start: 14, end: 17 }   // 14h00 - 17h00
    // Le créneau 17h-20h est supprimé car dépasse les heures d'ouverture (18h00)
  ];

  // Initialiser avec le token d'accès Google
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Vérifier si l'heure est dans les heures d'ouverture strictes
  private isWithinBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    
    return this.businessHours.days.includes(day) && 
           hour >= this.businessHours.start && 
           hour < this.businessHours.end;
  }

  // Vérifier si un créneau de 3h est valide et respecte les heures d'ouverture
  private isValidTimeSlot(startHour: number): boolean {
    const validSlot = this.timeSlots.find(slot => slot.start === startHour);
    if (!validSlot) return false;
    
    // Vérifier que le créneau entier est dans les heures d'ouverture
    return validSlot.start >= this.businessHours.start && 
           validSlot.end <= this.businessHours.end;
  }

  // Créer un événement de rendez-vous automatiquement dans Google Calendar
  async createAppointment(eventData: {
    title: string;
    description: string;
    startTime: Date;
    duration: number; // en minutes
    customerEmail: string;
    customerName: string;
    location: string;
  }): Promise<string> {
    // Vérifier les heures d'ouverture
    if (!this.isWithinBusinessHours(eventData.startTime)) {
      throw new Error(`Les rendez-vous sont disponibles du lundi au dimanche de ${this.businessHours.start}h00 à ${this.businessHours.end}h00 seulement.`);
    }

    // Vérifier que c'est un créneau de 3h valide respectant les heures d'ouverture
    const startHour = eventData.startTime.getHours();
    if (!this.isValidTimeSlot(startHour)) {
      throw new Error('Veuillez sélectionner un créneau de 3 heures valide respectant nos heures d\'ouverture (8h-11h, 11h-14h, 14h-17h).');
    }

    // Calculer la fin du créneau de 3h (pas seulement la durée du service)
    const endTime = new Date(eventData.startTime);
    endTime.setHours(startHour + 3); // Bloquer tout le créneau de 3h
    
    // Vérifier que la fin du créneau ne dépasse pas les heures d'ouverture
    if (endTime.getHours() > this.businessHours.end) {
      throw new Error(`Le créneau sélectionné dépasse nos heures d'ouverture (fermeture à ${this.businessHours.end}h00).`);
    }
    
    const event: GoogleCalendarEvent = {
      summary: `${this.companyName} - ${eventData.title}`,
      description: `
📅 Rendez-vous ${this.companyName}

👤 Client: ${eventData.customerName}
📧 Email: ${eventData.customerEmail}
📍 Adresse: ${eventData.location}

📝 Services demandés:
${eventData.description}

⏰ Durée estimée du service: ${eventData.duration} minutes
🕐 Créneau réservé: 3 heures (${startHour}h00 - ${startHour + 3}h00)
🏢 Heures d'ouverture: ${this.businessHours.start}h00 - ${this.businessHours.end}h00

🔧 ${this.companyName} - Service mobile professionnel
📞 Contactez-nous pour toute modification
      `.trim(),
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'America/Toronto'
      },
      end: {
        dateTime: endTime.toISOString(), // Fin du créneau de 3h
        timeZone: 'America/Toronto'
      },
      attendees: [
        {
          email: eventData.customerEmail,
          displayName: eventData.customerName
        }
      ],
      location: eventData.location
    };

    try {
      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        event,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Créneau de 3h réservé dans Google Calendar pour ${this.companyName} (${this.businessHours.start}h-${this.businessHours.end}h):`, response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('❌ Erreur création événement Google Calendar:', error);
      throw new Error(`Impossible de réserver le créneau dans Google Calendar. Veuillez contacter ${this.companyName}.`);
    }
  }

  // Mettre à jour un rendez-vous
  async updateAppointment(eventId: string, eventData: Partial<GoogleCalendarEvent>): Promise<void> {
    try {
      await axios.put(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
        {
          ...eventData,
          summary: eventData.summary ? `${this.companyName} - ${eventData.summary}` : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Rendez-vous mis à jour pour ${this.companyName}:`, eventId);
    } catch (error) {
      console.error('❌ Erreur mise à jour événement Google Calendar:', error);
      throw new Error('Impossible de mettre à jour le rendez-vous');
    }
  }

  // Supprimer un rendez-vous
  async deleteAppointment(eventId: string): Promise<void> {
    try {
      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      console.log(`✅ Rendez-vous supprimé pour ${this.companyName}:`, eventId);
    } catch (error) {
      console.error('❌ Erreur suppression événement Google Calendar:', error);
      throw new Error('Impossible de supprimer le rendez-vous');
    }
  }

  // Vérifier les créneaux de 3h disponibles selon les réservations existantes et les heures d'ouverture
  async getAvailableSlots(date: Date): Promise<Array<{ start: Date; end: Date }>> {
    // Vérifier si le jour est dans les heures d'ouverture
    if (!this.businessHours.days.includes(date.getDay())) {
      return []; // Pas de créneaux disponibles ce jour
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(this.businessHours.start, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(this.businessHours.end, 0, 0, 0);

      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        {
          params: {
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      // Obtenir les créneaux occupés
      const busySlots = response.data.items
        .filter((event: any) => event.start?.dateTime && event.end?.dateTime)
        .map((event: any) => ({
          start: new Date(event.start.dateTime),
          end: new Date(event.end.dateTime)
        }));

      // Calculer les créneaux de 3h disponibles respectant les heures d'ouverture
      const availableSlots: Array<{ start: Date; end: Date }> = [];
      
      for (const timeSlot of this.timeSlots) {
        // Vérifier que le créneau respecte les heures d'ouverture
        if (timeSlot.start < this.businessHours.start || timeSlot.end > this.businessHours.end) {
          continue; // Ignorer les créneaux hors heures d'ouverture
        }
        
        const slotStart = new Date(date);
        slotStart.setHours(timeSlot.start, 0, 0, 0);
        
        const slotEnd = new Date(date);
        slotEnd.setHours(timeSlot.end, 0, 0, 0);
        
        // Vérifier si ce créneau de 3h est libre
        const isSlotBusy = busySlots.some(busy => {
          // Un créneau est occupé s'il y a un chevauchement
          return (busy.start < slotEnd && busy.end > slotStart);
        });
        
        if (!isSlotBusy) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd
          });
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('❌ Erreur récupération créneaux:', error);
      // En cas d'erreur, retourner tous les créneaux valides comme disponibles
      return this.timeSlots
        .filter(slot => slot.start >= this.businessHours.start && slot.end <= this.businessHours.end)
        .map(slot => {
          const start = new Date(date);
          start.setHours(slot.start, 0, 0, 0);
          const end = new Date(date);
          end.setHours(slot.end, 0, 0, 0);
          return { start, end };
        });
    }
  }

  // Obtenir les heures d'ouverture et créneaux disponibles
  getBusinessHours() {
    return {
      companyName: this.companyName,
      hours: `${this.businessHours.start}h00 - ${this.businessHours.end}h00`,
      days: 'Lundi au dimanche',
      timeSlots: this.timeSlots.map(slot => `${slot.start}h00 - ${slot.end}h00`),
      slotDuration: '3 heures',
      emergency: false, // Pas de service d'urgence 24h
      openingHours: this.businessHours,
      validSlots: this.timeSlots
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
