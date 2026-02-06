import { Component, Inject, Input, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChantierService } from '../../../services/chantier/chantier.service';
import * as L from 'leaflet';
import { isPlatformBrowser } from '@angular/common';
import { OffreService } from '../../../services/offres/offre.service';

@Component({
  selector: 'app-chantier-detail',
  templateUrl: './chantier-detail.component.html',
  styleUrl: './chantier-detail.component.css'
})
export class ChantierDetailComponent implements OnInit {
  
  errorMessage: string | null = null;
  
  chantier: any ;

  chantierDetails: any = null;
  private map: L.Map | null = null;

  typeChantier: string | null = null;

  showNoAvancement: boolean = false;

  role: string | null | undefined;

 

  
  constructor(
    private route: ActivatedRoute,
    private chantierService: ChantierService, 
    private offreService: OffreService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  
  ngOnInit(): void {
    this.role = localStorage.getItem('user_role');

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;
    if (id !== null) {
      this.chantierService.getChantierById(id).subscribe({
        next: async (chantier: any) => {
          this.chantier = chantier;
          
          // Fetch offre details using offreId
          if (chantier.offreId) {
            this.offreService.getOffreById(chantier.offreId).subscribe({
              next: (offre: any) => {
                this.typeChantier = offre.type; // Store the offre type
                // You can now use this.offreType in your template or elsewhere
                console.log('Offre type:', this.typeChantier);
              },
              error: (error) => {
                console.error('Error fetching offre:', error);
              }
            });
          }
          let coordinates = chantier.coordinates;
          if (!coordinates && chantier.localisation) {
            coordinates = await this.getCoordinatesFromAddress(chantier.localisation);
          }
          const formattedDate = this.formatDateWithoutTimezoneShift(chantier.dateDeDebut);
          this.chantierDetails = {
            titre: chantier.titre || '-',
            localisation: chantier.localisation || '-',
            client: chantier.client || '-',
            coutTotal: chantier.coutTotal || 0,
            dateDeDebut:  formattedDate || '-',
            cumulPartBeehive : chantier.cumulPartBeehive || 0,
            progression : chantier.progression,
            coordinates: coordinates
        
          };

            this.initializeMap();
          
        },
        error: () => {
          this.errorMessage = 'Erreur lors du chargement des données du chantier.';
        }
      });
    }


  }

  private async getCoordinatesFromAddress(address: string): Promise<{ lat: number, lon: number } | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  ngAfterViewInit(): void {
    // Initialize map container
    this.initializeMap();
  }

 


  private async initializeMap(): Promise<void> {
    // Only run on browser
    if (!isPlatformBrowser(this.platformId)) return;

    // Dynamically import Leaflet only in browser
    try {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;


       const iconDefault = L.icon({
      iconUrl: 'assets/images/leaflet/marker-icon.png',
      iconRetinaUrl: 'assets/images/leaflet/marker-icon-2x.png',
      shadowUrl: 'assets/images/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
      
    L.Marker.prototype.options.icon = iconDefault;

     
      this.ngZone.runOutsideAngular(() => {
        const mapContainer = document.getElementById('map-container');
        
        // Remove existing map if it exists
        if (this.map) {
          this.map.remove();
        }

        // Only create map if container exists and coordinates are available
        if (mapContainer && this.chantierDetails?.coordinates) {
          // Create new map
          this.map = L.map('map-container');
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);

          // Set view and add marker
          const coords = this.chantierDetails.coordinates;
          this.map.setView([coords.lat, coords.lon], 13);

          // Add a marker
          L.marker([coords.lat, coords.lon]).addTo(this.map)
            .bindPopup(this.chantierDetails.titre || 'Localisation du chantier')
            .openPopup();
        }
      });
    } catch (error) {
      console.error('Error loading Leaflet', error);
    }
  }

  private formatDateWithoutTimezoneShift(dateStr: string): string {
    // Parse the date string directly without timezone conversion
    if (!dateStr) return '';
    
    // Extract the date part only (YYYY-MM-DD)
    const parts = dateStr.split('T');
    if (parts.length > 0) {
      return parts[0]; // Return just the date part
    }
    return '';
  }
  
  navigateTo(section: string): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (section === 'situations') {
    if (!this.chantier || !this.chantier.coutTotal || this.chantier.coutTotal === 0) {
      this.showNoAvancement = true;
        setTimeout(() => {
    this.showNoAvancement = false;
  }, 3000);
      return;
    }
  }

    if (id) {
      this.router.navigate(['accueil/chantiers', id, section]);
    }
  }
  
  navigateToChantierDetails(): void {
    if (this.chantier?.id) {
      this.router.navigate(['accueil/chantiers', this.chantier.id]);
    }
  }
  
  navigateToChantierCards(): void {
    this.router.navigate(['accueil/chantiers']);
  }
}