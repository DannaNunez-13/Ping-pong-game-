using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class MainMenuController : MonoBehaviour
{
    [Header("UI Panels")]
    public GameObject mainMenuPanel;
    public GameObject gameModePanel;
    public GameObject shopPanel;
    public GameObject customizePanel;
    public GameObject optionsPanel;
    public GameObject profilePanel;
    
    [Header("Player Info UI")]
    public Text playerNameText;
    public Text playerLevelText;
    public Text coinsText;
    public Text starsText;
    public Slider experienceBar;
    
    [Header("Main Buttons")]
    public Button playButton;
    public Button shopButton;
    public Button customizeButton;
    public Button optionsButton;
    public Button exitButton;
    
    [Header("Side Panel Buttons")]
    public Button profileButton;
    public Button achievementsButton;
    public Button rankingButton;
    
    [Header("Bottom Navigation")]
    public Button homeNavButton;
    public Button shopNavButton;
    public Button inventoryNavButton;
    public Button settingsNavButton;
    
    [Header("Background Elements")]
    public GameObject pingPongTable;
    public Camera backgroundCamera;
    public Light[] dynamicLights;
    
    [Header("Animation Settings")]
    public float panelTransitionDuration = 0.5f;
    public AnimationCurve transitionCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
    
    private UIManager uiManager;
    private CurrencyManager currencyManager;
    private GameObject currentActivePanel;
    
    void Start()
    {
        InitializeComponents();
        SetupButtonListeners();
        ShowMainMenu();
        StartBackgroundAnimations();
        UpdatePlayerInfo();
    }
    
    void InitializeComponents()
    {
        uiManager = FindObjectOfType<UIManager>();
        currencyManager = FindObjectOfType<CurrencyManager>();
        currentActivePanel = mainMenuPanel;
        
        // Hide all panels except main menu
        HideAllPanels();
        mainMenuPanel.SetActive(true);
    }
    
    void SetupButtonListeners()
    {
        // Main buttons
        playButton.onClick.AddListener(() => ShowGameModeSelection());
        shopButton.onClick.AddListener(() => ShowShop());
        customizeButton.onClick.AddListener(() => ShowCustomize());
        optionsButton.onClick.AddListener(() => ShowOptions());
        exitButton.onClick.AddListener(() => ExitGame());
        
        // Side panel buttons
        profileButton.onClick.AddListener(() => ShowProfile());
        achievementsButton.onClick.AddListener(() => ShowAchievements());
        rankingButton.onClick.AddListener(() => ShowRanking());
        
        // Bottom navigation
        homeNavButton.onClick.AddListener(() => ShowMainMenu());
        shopNavButton.onClick.AddListener(() => ShowShop());
        inventoryNavButton.onClick.AddListener(() => ShowInventory());
        settingsNavButton.onClick.AddListener(() => ShowOptions());
    }
    
    public void ShowMainMenu()
    {
        SwitchPanel(mainMenuPanel);
        UpdatePlayerInfo();
    }
    
    public void ShowGameModeSelection()
    {
        SwitchPanel(gameModePanel);
    }
    
    public void ShowShop()
    {
        SwitchPanel(shopPanel);
        if (FindObjectOfType<ShopSystem>())
            FindObjectOfType<ShopSystem>().RefreshShop();
    }
    
    public void ShowCustomize()
    {
        SwitchPanel(customizePanel);
    }
    
    public void ShowOptions()
    {
        SwitchPanel(optionsPanel);
    }
    
    public void ShowProfile()
    {
        SwitchPanel(profilePanel);
    }
    
    public void ShowAchievements()
    {
        // Implementar sistema de logros
        uiManager.ShowNotification("Logros - Próximamente");
    }
    
    public void ShowRanking()
    {
        // Implementar sistema de ranking
        uiManager.ShowNotification("Ranking - Próximamente");
    }
    
    public void ShowInventory()
    {
        // Implementar inventario
        uiManager.ShowNotification("Inventario - Próximamente");
    }
    
    void SwitchPanel(GameObject targetPanel)
    {
        if (currentActivePanel == targetPanel) return;
        
        StartCoroutine(PanelTransition(currentActivePanel, targetPanel));
    }
    
    IEnumerator PanelTransition(GameObject fromPanel, GameObject toPanel)
    {
        // Fade out current panel
        if (fromPanel != null)
        {
            yield return StartCoroutine(AnimatePanel(fromPanel, false));
            fromPanel.SetActive(false);
        }
        
        // Fade in new panel
        toPanel.SetActive(true);
        yield return StartCoroutine(AnimatePanel(toPanel, true));
        
        currentActivePanel = toPanel;
    }
    
    IEnumerator AnimatePanel(GameObject panel, bool fadeIn)
    {
        CanvasGroup canvasGroup = panel.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
        {
            canvasGroup = panel.AddComponent<CanvasGroup>();
        }
        
        float startAlpha = fadeIn ? 0f : 1f;
        float endAlpha = fadeIn ? 1f : 0f;
        float elapsedTime = 0f;
        
        while (elapsedTime < panelTransitionDuration)
        {
            elapsedTime += Time.deltaTime;
            float progress = transitionCurve.Evaluate(elapsedTime / panelTransitionDuration);
            canvasGroup.alpha = Mathf.Lerp(startAlpha, endAlpha, progress);
            yield return null;
        }
        
        canvasGroup.alpha = endAlpha;
    }
    
    void HideAllPanels()
    {
        GameObject[] panels = { mainMenuPanel, gameModePanel, shopPanel, 
                               customizePanel, optionsPanel, profilePanel };
        
        foreach (GameObject panel in panels)
        {
            if (panel != null)
                panel.SetActive(false);
        }
    }
    
    void UpdatePlayerInfo()
    {
        if (currencyManager != null)
        {
            playerNameText.text = PlayerPrefs.GetString("PlayerName", "Jugador");
            playerLevelText.text = "Nivel " + PlayerPrefs.GetInt("PlayerLevel", 1);
            coinsText.text = currencyManager.GetCoins().ToString();
            starsText.text = currencyManager.GetStars().ToString();
            
            // Update experience bar
            int currentExp = PlayerPrefs.GetInt("PlayerExp", 0);
            int expToNextLevel = GetExpRequiredForNextLevel();
            experienceBar.value = (float)currentExp / expToNextLevel;
        }
    }
    
    int GetExpRequiredForNextLevel()
    {
        int currentLevel = PlayerPrefs.GetInt("PlayerLevel", 1);
        return currentLevel * 100; // 100 exp per level
    }
    
    void StartBackgroundAnimations()
    {
        // Animate ping pong table
        if (pingPongTable != null)
        {
            StartCoroutine(RotateTable());
        }
        
        // Animate camera
        if (backgroundCamera != null)
        {
            StartCoroutine(CameraMovement());
        }
        
        // Animate lights
        StartCoroutine(AnimateLights());
    }
    
    IEnumerator RotateTable()
    {
        while (true)
        {
            pingPongTable.transform.Rotate(Vector3.up * 10f * Time.deltaTime);
            yield return null;
        }
    }
    
    IEnumerator CameraMovement()
    {
        Vector3 originalPosition = backgroundCamera.transform.position;
        
        while (true)
        {
            float offsetX = Mathf.Sin(Time.time * 0.5f) * 0.5f;
            float offsetY = Mathf.Cos(Time.time * 0.3f) * 0.3f;
            
            backgroundCamera.transform.position = originalPosition + new Vector3(offsetX, offsetY, 0);
            yield return null;
        }
    }
    
    IEnumerator AnimateLights()
    {
        while (true)
        {
            foreach (Light light in dynamicLights)
            {
                if (light != null)
                {
                    light.intensity = 1f + Mathf.Sin(Time.time * 2f + light.GetInstanceID()) * 0.3f;
                }
            }
            yield return null;
        }
    }
    
    public void ExitGame()
    {
        uiManager.ShowConfirmDialog("¿Estás seguro de que quieres salir?", 
            () => {
                #if UNITY_EDITOR
                    UnityEditor.EditorApplication.isPlaying = false;
                #else
                    Application.Quit();
                #endif
            });
    }
    
    void Update()
    {
        // Handle back button on Android
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            if (currentActivePanel != mainMenuPanel)
            {
                ShowMainMenu();
            }
            else
            {
                ExitGame();
            }
        }
    }
}