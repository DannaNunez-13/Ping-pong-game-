# Guía de Configuración - Menú Principal Ping Pong 3D

## Estructura de la Escena

### 1. Canvas Principal (Screen Space - Overlay)
```
MainCanvas
├── Background (Image - Gradiente dinámico)
├── PlayerInfoPanel (Top)
│   ├── PlayerName (Text)
│   ├── PlayerLevel (Text)
│   ├── CoinsContainer
│   │   ├── CoinIcon (Image)
│   │   └── CoinsText (Text)
│   ├── StarsContainer
│   │   ├── StarIcon (Image)
│   │   └── StarsText (Text)
│   └── ExperienceBar (Slider)
├── MainMenuPanel
│   ├── GameTitle (Text - "PING PONG 3D")
│   ├── MainButtons
│   │   ├── PlayButton
│   │   ├── ShopButton
│   │   ├── CustomizeButton
│   │   ├── OptionsButton
│   │   └── ExitButton
├── SidePanel (Right)
│   ├── ProfileButton
│   ├── AchievementsButton
│   └── RankingButton
├── BottomNavigation
│   ├── HomeNavButton
│   ├── ShopNavButton
│   ├── InventoryNavButton
│   └── SettingsNavButton
├── GameModePanel (Initially Hidden)
│   ├── ModeTitle (Text - "Seleccionar Modo")
│   ├── GameModeButtons
│   │   ├── OneVsOneButton
│   │   ├── MultiBallButton
│   │   ├── TimeAttackButton
│   │   └── TournamentButton
│   ├── DifficultyButtons
│   │   ├── EasyButton
│   │   ├── MediumButton
│   │   └── HardButton
│   ├── SelectedModeText
│   ├── SelectedDifficultyText
│   └── StartGameButton
├── ShopPanel (Initially Hidden)
│   ├── ShopTitle (Text - "TIENDA")
│   ├── TabButtons
│   │   ├── BallsTabButton
│   │   ├── TablesTabButton
│   │   └── EnvironmentsTabButton
│   ├── ShopItemsScrollView
│   │   └── ShopItemsGrid (Grid Layout Group)
│   ├── ItemPreviewPanel
│   │   ├── PreviewContainer (3D Preview)
│   │   ├── ItemNameText
│   │   ├── ItemDescriptionText
│   │   ├── ItemPriceText
│   │   ├── PurchaseButton
│   │   └── EquipButton
├── CustomizePanel (Initially Hidden)
├── OptionsPanel (Initially Hidden)
├── ProfilePanel (Initially Hidden)
├── NotificationParent (For UI notifications)
├── DialogParent (For confirmation dialogs)
└── FadePanel (Full screen black image, alpha 0)
```

### 2. Escena 3D (Background)
```
3D Scene
├── BackgroundCamera
├── PingPongTable (3D Model)
├── DynamicLights
│   ├── MainLight (Directional)
│   ├── AccentLight1 (Point - Color dinámico)
│   ├── AccentLight2 (Point - Color dinámico)
│   └── RimLight (Spot)
├── ParticleEffects (Opcional)
└── Skybox (Gradiente futurista)
```

## Configuración de Scripts

### 1. MainMenuController
- Agregar al GameObject "MenuManager"
- Asignar todas las referencias de UI en el inspector
- Configurar duración de transiciones (0.5s recomendado)

### 2. UIManager
- Agregar al GameObject "UIManager"
- Crear prefabs para notificaciones y diálogos
- Configurar referencias de fade panel y loading screen

### 3. ShopSystem
- Agregar al GameObject "ShopManager"
- Configurar items de tienda en las listas del inspector
- Crear prefab para ShopItem UI

### 4. CurrencyManager
- Agregar al GameObject "CurrencyManager"
- Configurar valores iniciales y recompensas
- Asignar referencias de UI para monedas y estrellas

### 5. SceneLoader
- Se crea automáticamente como singleton
- Configurar nombres de escenas en el inspector

## Prefabs Necesarios

### ShopItem Prefab
```
ShopItemPrefab
├── Background (Image)
├── Icon (Image)
├── Name (Text)
├── Price (Text)
├── PurchasedIndicator (GameObject con checkmark)
├── EquippedIndicator (GameObject con star)
└── Button (Button component en root)
```

### Notification Prefab
```
NotificationPrefab
├── Background (Image con color semi-transparente)
├── Icon (Image - opcional)
├── Text (Text)
└── CanvasGroup (Para animaciones)
```

### Confirm Dialog Prefab
```
ConfirmDialogPrefab
├── Background (Image oscura semi-transparente)
├── DialogPanel (Image)
│   ├── Title (Text)
│   ├── Message (Text)
│   ├── ConfirmButton (Button)
│   └── CancelButton (Button)
└── CanvasGroup (Para animaciones)
```

## Configuración Visual

### Colores Recomendados
- **Primario**: #00FF88 (Verde neón)
- **Secundario**: #FF6B6B (Rojo coral)
- **Acento**: #4ECDC4 (Turquesa)
- **Fondo**: #2C3E50 (Azul oscuro)
- **Texto**: #FFFFFF (Blanco)

### Fuentes
- **Títulos**: Bold, 36-48px
- **Botones**: Semi-bold, 24-32px
- **Texto normal**: Regular, 18-24px
- **UI pequeña**: Regular, 14-18px

### Efectos Visuales
- **Sombras**: Drop Shadow con offset (2, -2)
- **Brillos**: Outer Glow con colores neón
- **Gradientes**: Linear gradients para fondos
- **Animaciones**: Ease-in-out curves

## Items de Tienda Ejemplo

### Pelotas
1. **Pelota Clásica** (Gratis, equipada por defecto)
2. **Pelota Neón** (50 monedas)
3. **Pelota Fuego** (100 monedas)
4. **Pelota Arcoíris** (150 monedas)
5. **Pelota Diamante** (300 monedas)

### Mesas
1. **Mesa Clásica** (Gratis, equipada por defecto)
2. **Mesa Futurista** (200 monedas)
3. **Mesa Cristal** (400 monedas)
4. **Mesa Holográfica** (600 monedas)

### Escenarios
1. **Gimnasio Clásico** (Gratis, equipado por defecto)
2. **Estadio Futurista** (300 monedas)
3. **Espacio Exterior** (500 monedas)
4. **Ciudad Neón** (800 monedas)

## Configuración de Cámara Background

### Posición y Rotación
- **Position**: (0, 2, -5)
- **Rotation**: (10, 0, 0)
- **FOV**: 45°

### Movimiento Dinámico
- **Amplitud X**: 0.5 unidades
- **Amplitud Y**: 0.3 unidades
- **Velocidad**: 0.5 unidades/segundo

## Sistema de Recompensas

### Por Victoria
- **Fácil**: 10 monedas
- **Medio**: 20 monedas
- **Difícil**: 30 monedas + 1 estrella
- **Torneo**: 50 monedas + 1 estrella

### Bonus Diario
- **50 monedas** por día

### Logros
- Configurar en CurrencyManager.AwardAchievement()

## Notas de Implementación

1. **Orden de Carga**: LoadingScreen → MainMenu → GameScene
2. **Persistencia**: Usar PlayerPrefs para guardar progreso
3. **Optimización**: Pool de objetos para notificaciones
4. **Responsive**: Configurar anchors para diferentes resoluciones
5. **Audio**: Agregar AudioSource para efectos de sonido