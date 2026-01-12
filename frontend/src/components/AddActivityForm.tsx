import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyData, MyActivity } from '@/hooks/useMyData';
import { toast } from '@/hooks/use-toast';

export const AddActivityForm = () => {
  const { addActivity } = useMyData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    distance: '',
    moving_time: '',
    elapsed_time: '',
    total_elevation_gain: '',
    type: 'Run',
    start_date: '',
    start_date_local: '',
    average_speed: '',
    max_speed: '',
    average_heartrate: '',
    max_heartrate: '',
    elev_high: '',
    elev_low: '',
    description: '',
    calories: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const activityData = {
        ...formData,
        distance: parseFloat(formData.distance) || 0,
        moving_time: parseInt(formData.moving_time) || 0,
        elapsed_time: parseInt(formData.elapsed_time) || 0,
        total_elevation_gain: parseFloat(formData.total_elevation_gain) || 0,
        average_speed: parseFloat(formData.average_speed) || 0,
        max_speed: parseFloat(formData.max_speed) || 0,
        average_heartrate: formData.average_heartrate ? parseFloat(formData.average_heartrate) : undefined,
        max_heartrate: formData.max_heartrate ? parseFloat(formData.max_heartrate) : undefined,
        elev_high: formData.elev_high ? parseFloat(formData.elev_high) : undefined,
        elev_low: formData.elev_low ? parseFloat(formData.elev_low) : undefined,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
      };

      await addActivity(activityData);
      
      // Reset form
      setFormData({
        name: '',
        distance: '',
        moving_time: '',
        elapsed_time: '',
        total_elevation_gain: '',
        type: 'Run',
        start_date: '',
        start_date_local: '',
        average_speed: '',
        max_speed: '',
        average_heartrate: '',
        max_heartrate: '',
        elev_high: '',
        elev_low: '',
        description: '',
        calories: ''
      });

      toast({
        title: "Attività aggiunta",
        description: "La tua attività è stata aggiunta con successo!",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta dell'attività. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Aggiungi Nuova Attività</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Attività *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="es. Corsa mattutina"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo Attività</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Run">Corsa</SelectItem>
                  <SelectItem value="Walk">Camminata</SelectItem>
                  <SelectItem value="Hike">Escursione</SelectItem>
                  <SelectItem value="Ride">Ciclismo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distanza (metri) *</Label>
              <Input
                id="distance"
                type="number"
                step="0.01"
                value={formData.distance}
                onChange={(e) => handleInputChange('distance', e.target.value)}
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moving_time">Tempo di Movimento (secondi) *</Label>
              <Input
                id="moving_time"
                type="number"
                value={formData.moving_time}
                onChange={(e) => handleInputChange('moving_time', e.target.value)}
                placeholder="1800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elapsed_time">Tempo Totale (secondi)</Label>
              <Input
                id="elapsed_time"
                type="number"
                value={formData.elapsed_time}
                onChange={(e) => handleInputChange('elapsed_time', e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_elevation_gain">Dislivello (metri)</Label>
              <Input
                id="total_elevation_gain"
                type="number"
                step="0.1"
                value={formData.total_elevation_gain}
                onChange={(e) => handleInputChange('total_elevation_gain', e.target.value)}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Data Inizio (ISO)</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_speed">Velocità Media (m/s)</Label>
              <Input
                id="average_speed"
                type="number"
                step="0.01"
                value={formData.average_speed}
                onChange={(e) => handleInputChange('average_speed', e.target.value)}
                placeholder="2.8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_speed">Velocità Massima (m/s)</Label>
              <Input
                id="max_speed"
                type="number"
                step="0.01"
                value={formData.max_speed}
                onChange={(e) => handleInputChange('max_speed', e.target.value)}
                placeholder="3.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_heartrate">Frequenza Cardiaca Media (bpm)</Label>
              <Input
                id="average_heartrate"
                type="number"
                value={formData.average_heartrate}
                onChange={(e) => handleInputChange('average_heartrate', e.target.value)}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_heartrate">Frequenza Cardiaca Massima (bpm)</Label>
              <Input
                id="max_heartrate"
                type="number"
                value={formData.max_heartrate}
                onChange={(e) => handleInputChange('max_heartrate', e.target.value)}
                placeholder="180"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calorie</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Note sull'attività..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Aggiungendo..." : "Aggiungi Attività"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 