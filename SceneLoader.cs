using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;

public class SceneLoader : MonoBehaviour
{
    [Header("Scene Names")]
    public string loadingSceneName = "LoadingScreen";
    public string mainMenuSceneName = "MainMenu";
    public string gameSceneName = "GameScene";
    
    [Header("Loading Settings")]
    public float minimumLoadingTime = 2f;
    public bool useAsyncLoading = true;
    
    private static SceneLoader instance;
    public static SceneLoader Instance
    {
        get
        {
            if (instance == null)
            {
                GameObject go = new GameObject("SceneLoader");
                instance = go.AddComponent<SceneLoader>();
                DontDestroyOnLoad(go);
            }
            return instance;
        }
    }
    
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            Destroy(gameObject);
        }
    }
    
    public void LoadMainMenu()
    {
        LoadSceneWithTransition(mainMenuSceneName);
    }
    
    public void LoadGame(GameMode gameMode, GameDifficulty difficulty)
    {
        // Store game settings
        PlayerPrefs.SetInt("SelectedGameMode", (int)gameMode);
        PlayerPrefs.SetInt("SelectedDifficulty", (int)difficulty);
        
        LoadSceneWithTransition(gameSceneName);
    }
    
    public void LoadSceneWithTransition(string sceneName)
    {
        StartCoroutine(LoadSceneCoroutine(sceneName));
    }
    
    IEnumerator LoadSceneCoroutine(string sceneName)
    {
        UIManager uiManager = FindObjectOfType<UIManager>();
        
        // Fade out current scene
        if (uiManager != null)
        {
            uiManager.FadeScreen(true);
            yield return new WaitForSeconds(uiManager.fadeDuration);
        }
        
        // Load loading screen first
        if (!string.IsNullOrEmpty(loadingSceneName) && 
            SceneManager.GetActiveScene().name != loadingSceneName)
        {
            SceneManager.LoadScene(loadingSceneName);
            yield return null; // Wait one frame
        }
        
        // Start loading target scene
        float startTime = Time.time;
        
        if (useAsyncLoading)
        {
            AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
            asyncLoad.allowSceneActivation = false;
            
            // Update loading progress
            while (!asyncLoad.isDone)
            {
                float progress = Mathf.Clamp01(asyncLoad.progress / 0.9f);
                UpdateLoadingProgress(progress);
                
                // Check if loading is complete and minimum time has passed
                if (asyncLoad.progress >= 0.9f && 
                    Time.time - startTime >= minimumLoadingTime)
                {
                    asyncLoad.allowSceneActivation = true;
                }
                
                yield return null;
            }
        }
        else
        {
            // Simulate loading progress for synchronous loading
            float elapsedTime = 0f;
            while (elapsedTime < minimumLoadingTime)
            {
                elapsedTime += Time.deltaTime;
                float progress = elapsedTime / minimumLoadingTime;
                UpdateLoadingProgress(progress);
                yield return null;
            }
            
            SceneManager.LoadScene(sceneName);
        }
    }
    
    void UpdateLoadingProgress(float progress)
    {
        // Find loading screen controller and update progress
        LoadingScreenController loadingController = FindObjectOfType<LoadingScreenController>();
        if (loadingController != null)
        {
            // Update loading bar if available
            // This would need to be implemented in LoadingScreenController
        }
    }
    
    public void RestartCurrentScene()
    {
        string currentScene = SceneManager.GetActiveScene().name;
        LoadSceneWithTransition(currentScene);
    }
    
    public void QuitGame()
    {
        StartCoroutine(QuitGameCoroutine());
    }
    
    IEnumerator QuitGameCoroutine()
    {
        UIManager uiManager = FindObjectOfType<UIManager>();
        
        if (uiManager != null)
        {
            uiManager.FadeScreen(true);
            yield return new WaitForSeconds(uiManager.fadeDuration);
        }
        
        #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
        #else
            Application.Quit();
        #endif
    }
}

// Game mode selection system
public class GameModeSelector : MonoBehaviour
{
    [Header("Game Mode Buttons")]
    public Button oneVsOneButton;
    public Button multiBallButton;
    public Button timeAttackButton;
    public Button tournamentButton;
    
    [Header("Difficulty Buttons")]
    public Button easyButton;
    public Button mediumButton;
    public Button hardButton;
    
    [Header("UI Elements")]
    public Text selectedModeText;
    public Text selectedDifficultyText;
    public Button startGameButton;
    
    private GameMode selectedMode = GameMode.OneVsOne;
    private GameDifficulty selectedDifficulty = GameDifficulty.Easy;
    
    void Start()
    {
        SetupButtons();
        UpdateUI();
    }
    
    void SetupButtons()
    {
        // Game mode buttons
        oneVsOneButton.onClick.AddListener(() => SelectGameMode(GameMode.OneVsOne));
        multiBallButton.onClick.AddListener(() => SelectGameMode(GameMode.MultiBall));
        timeAttackButton.onClick.AddListener(() => SelectGameMode(GameMode.TimeAttack));
        tournamentButton.onClick.AddListener(() => SelectGameMode(GameMode.Tournament));
        
        // Difficulty buttons
        easyButton.onClick.AddListener(() => SelectDifficulty(GameDifficulty.Easy));
        mediumButton.onClick.AddListener(() => SelectDifficulty(GameDifficulty.Medium));
        hardButton.onClick.AddListener(() => SelectDifficulty(GameDifficulty.Hard));
        
        // Start game button
        startGameButton.onClick.AddListener(StartSelectedGame);
    }
    
    public void SelectGameMode(GameMode mode)
    {
        selectedMode = mode;
        UpdateUI();
        UpdateModeButtons();
    }
    
    public void SelectDifficulty(GameDifficulty difficulty)
    {
        selectedDifficulty = difficulty;
        UpdateUI();
        UpdateDifficultyButtons();
    }
    
    void UpdateUI()
    {
        if (selectedModeText != null)
        {
            selectedModeText.text = GetModeDisplayName(selectedMode);
        }
        
        if (selectedDifficultyText != null)
        {
            selectedDifficultyText.text = GetDifficultyDisplayName(selectedDifficulty);
        }
    }
    
    void UpdateModeButtons()
    {
        ResetButtonColor(oneVsOneButton);
        ResetButtonColor(multiBallButton);
        ResetButtonColor(timeAttackButton);
        ResetButtonColor(tournamentButton);
        
        Button selectedButton = null;
        switch (selectedMode)
        {
            case GameMode.OneVsOne:
                selectedButton = oneVsOneButton;
                break;
            case GameMode.MultiBall:
                selectedButton = multiBallButton;
                break;
            case GameMode.TimeAttack:
                selectedButton = timeAttackButton;
                break;
            case GameMode.Tournament:
                selectedButton = tournamentButton;
                break;
        }
        
        if (selectedButton != null)
        {
            HighlightButton(selectedButton);
        }
    }
    
    void UpdateDifficultyButtons()
    {
        ResetButtonColor(easyButton);
        ResetButtonColor(mediumButton);
        ResetButtonColor(hardButton);
        
        Button selectedButton = null;
        switch (selectedDifficulty)
        {
            case GameDifficulty.Easy:
                selectedButton = easyButton;
                break;
            case GameDifficulty.Medium:
                selectedButton = mediumButton;
                break;
            case GameDifficulty.Hard:
                selectedButton = hardButton;
                break;
        }
        
        if (selectedButton != null)
        {
            HighlightButton(selectedButton);
        }
    }
    
    void ResetButtonColor(Button button)
    {
        if (button != null)
        {
            ColorBlock colors = button.colors;
            colors.normalColor = Color.white;
            button.colors = colors;
        }
    }
    
    void HighlightButton(Button button)
    {
        if (button != null)
        {
            ColorBlock colors = button.colors;
            colors.normalColor = Color.yellow;
            button.colors = colors;
        }
    }
    
    string GetModeDisplayName(GameMode mode)
    {
        switch (mode)
        {
            case GameMode.OneVsOne:
                return "1 vs 1";
            case GameMode.MultiBall:
                return "Multi Pelota";
            case GameMode.TimeAttack:
                return "Contrarreloj";
            case GameMode.Tournament:
                return "Torneo";
            default:
                return "1 vs 1";
        }
    }
    
    string GetDifficultyDisplayName(GameDifficulty difficulty)
    {
        switch (difficulty)
        {
            case GameDifficulty.Easy:
                return "Fácil";
            case GameDifficulty.Medium:
                return "Medio";
            case GameDifficulty.Hard:
                return "Difícil";
            default:
                return "Fácil";
        }
    }
    
    void StartSelectedGame()
    {
        SceneLoader.Instance.LoadGame(selectedMode, selectedDifficulty);
    }
}