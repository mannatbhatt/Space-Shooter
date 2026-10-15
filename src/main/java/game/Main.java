package game;

import java.nio.FloatBuffer;
import java.util.Random;

import com.jme3.app.SimpleApplication;
import com.jme3.font.BitmapText;
import com.jme3.input.KeyInput;
import com.jme3.input.controls.ActionListener;
import com.jme3.input.controls.KeyTrigger;
import com.jme3.light.AmbientLight;
import com.jme3.light.DirectionalLight;
import com.jme3.material.Material;
import com.jme3.math.ColorRGBA;
import com.jme3.math.FastMath;
import com.jme3.math.Quaternion;
import com.jme3.math.Vector3f;
import com.jme3.scene.Geometry;
import com.jme3.scene.Mesh;
import com.jme3.scene.Node;
import com.jme3.scene.Spatial;
import com.jme3.scene.VertexBuffer;
import com.jme3.scene.mesh.IndexBuffer;
import com.jme3.scene.shape.Box;
import com.jme3.scene.shape.Sphere;

public class Main extends SimpleApplication {

    private Node ship;
    private final Node lasers = new Node("lasers");
    private final Node enemies = new Node("enemies");
    private final Random rng = new Random();

    private boolean left, right, up, down, shooting;
    private final float shipSpeed = 14f;
    private float fireCooldown = 0f;
    private float spawnTimer = 0f;
    private int score = 0;
    private BitmapText hud;

    // Difficulty settings: index 0 = Easy, 1 = Medium, 2 = Hard
    private int level = 0;
    private final String[] levelNames = {"EASY", "MEDIUM", "HARD"};
    private final float[] spawnEvery  = {1.6f, 1.1f, 0.6f};
    private final float[] asteroidSpeed = {12f, 20f, 32f};
    private final float[] spreadX = {10f, 18f, 26f};
    private final float[] spreadY = {5f, 9f, 13f};
    private final float[] minRadius = {1.6f, 1.2f, 0.9f};
    private final float[] maxRadius = {2.4f, 2.0f, 1.6f};

    public static void main(String[] args) {
        new Main().start();
    }

    @Override
    public void simpleInitApp() {
        setDisplayStatView(false);
        setDisplayFps(false);
        flyCam.setEnabled(false);
        viewPort.setBackgroundColor(ColorRGBA.Black);

        // Lighting
        DirectionalLight sun = new DirectionalLight();
        sun.setDirection(new Vector3f(-1, -1, -1).normalizeLocal());
        sun.setColor(ColorRGBA.White.mult(1.2f));
        rootNode.addLight(sun);
        rootNode.addLight(new AmbientLight(ColorRGBA.White.mult(0.3f)));

        buildShip();
        buildStars(400);
        rootNode.attachChild(lasers);
        rootNode.attachChild(enemies);
        setupKeys();
        setupHud();

        // Camera behind the ship
        cam.setLocation(new Vector3f(0, 4, 18));
        cam.lookAt(new Vector3f(0, 0, 0), Vector3f.UNIT_Y);
    }

    private void buildShip() {
        ship = new Node("ship");

        Geometry body = new Geometry("body", new Box(0.6f, 0.2f, 1.5f));
        body.setMaterial(lit(ColorRGBA.Gray));

        Geometry wings = new Geometry("wings", new Box(1.8f, 0.05f, 0.5f));
        wings.setMaterial(lit(ColorRGBA.Blue));
        wings.setLocalTranslation(0, 0, 0.5f);

        ship.attachChild(body);
        ship.attachChild(wings);
        rootNode.attachChild(ship);
    }

    private void buildStars(int count) {
        for (int i = 0; i < count; i++) {
            Geometry star = new Geometry("star", new Sphere(6, 6, 0.08f));
            Material m = new Material(assetManager, "Common/MatDefs/Misc/Unshaded.j3md");
            m.setColor("Color", ColorRGBA.White);
            star.setMaterial(m);
            star.setLocalTranslation(
                (rng.nextFloat() - 0.5f) * 200,
                (rng.nextFloat() - 0.5f) * 120,
                -rng.nextFloat() * 300);
            rootNode.attachChild(star);
        }
    }

    private Material lit(ColorRGBA color) {
        Material m = new Material(assetManager, "Common/MatDefs/Light/Lighting.j3md");
        m.setBoolean("UseMaterialColors", true);
        m.setColor("Diffuse", color);
        m.setColor("Ambient", color);
        return m;
    }

    private void setupHud() {
        hud = new BitmapText(guiFont);
        hud.setSize(guiFont.getCharSet().getRenderedSize() * 1.2f);
        hud.setColor(ColorRGBA.White);
        hud.setLocalTranslation(10, cam.getHeight() - 10, 0);
        guiNode.attachChild(hud);
        updateHud();
    }

    private void updateHud() {
        hud.setText("Level: " + levelNames[level] + "    Score: " + score
            + "\nPress 1 = Easy, 2 = Medium, 3 = Hard    |    Hold SPACE to fire");
    }

    private void setLevel(int newLevel) {
        level = newLevel;
        spawnTimer = 0f;
        enemies.detachAllChildren();
        updateHud();
    }

    // Builds a lumpy rock: a sphere whose vertices are pushed in/out smoothly
    private Mesh makeRockMesh(float radius) {
        Sphere mesh = new Sphere(20, 20, radius);
        VertexBuffer pvb = mesh.getBuffer(VertexBuffer.Type.Position);
        FloatBuffer pb = (FloatBuffer) pvb.getData();
        int n = pb.limit() / 3;

        float p1 = rng.nextFloat() * 6.28f;
        float p2 = rng.nextFloat() * 6.28f;
        float p3 = rng.nextFloat() * 6.28f;

        for (int i = 0; i < n; i++) {
            float x = pb.get(i * 3), y = pb.get(i * 3 + 1), z = pb.get(i * 3 + 2);
            Vector3f d = new Vector3f(x, y, z).normalizeLocal();
            float f = 1f
                + 0.18f * FastMath.sin(d.x * 4f + p1)
                + 0.15f * FastMath.sin(d.y * 5f + p2)
                + 0.12f * FastMath.sin(d.z * 3f + p3)
                + 0.07f * FastMath.sin(d.x * 9f + d.z * 7f + p2);
            pb.put(i * 3, x * f);
            pb.put(i * 3 + 1, y * f);
            pb.put(i * 3 + 2, z * f);
        }
        pvb.updateData(pb);

        // Recalculate normals so the rock looks rough when lit
        IndexBuffer ib = mesh.getIndexBuffer();
        float[] nrm = new float[n * 3];
        Vector3f a = new Vector3f(), b = new Vector3f(), c = new Vector3f();
        for (int i = 0; i < ib.size(); i += 3) {
            int i0 = ib.get(i), i1 = ib.get(i + 1), i2 = ib.get(i + 2);
            a.set(pb.get(i0 * 3), pb.get(i0 * 3 + 1), pb.get(i0 * 3 + 2));
            b.set(pb.get(i1 * 3), pb.get(i1 * 3 + 1), pb.get(i1 * 3 + 2));
            c.set(pb.get(i2 * 3), pb.get(i2 * 3 + 1), pb.get(i2 * 3 + 2));
            Vector3f fn = b.subtract(a).crossLocal(c.subtract(a));
            int[] ids = {i0, i1, i2};
            for (int k : ids) {
                nrm[k * 3] += fn.x;
                nrm[k * 3 + 1] += fn.y;
                nrm[k * 3 + 2] += fn.z;
            }
        }
        VertexBuffer nvb = mesh.getBuffer(VertexBuffer.Type.Normal);
        FloatBuffer nb = (FloatBuffer) nvb.getData();
        for (int i = 0; i < n; i++) {
            Vector3f nv = new Vector3f(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]).normalizeLocal();
            Vector3f pos = new Vector3f(pb.get(i * 3), pb.get(i * 3 + 1), pb.get(i * 3 + 2));
            if (nv.dot(pos) < 0) {
                nv.negateLocal(); // make sure normals point outward
            }
            nb.put(i * 3, nv.x);
            nb.put(i * 3 + 1, nv.y);
            nb.put(i * 3 + 2, nv.z);
        }
        nvb.updateData(nb);
        mesh.updateBound();
        return mesh;
    }

    private void fireLaser() {
        Geometry laser = new Geometry("laser", new Box(0.08f, 0.08f, 1.2f));
        Material m = new Material(assetManager, "Common/MatDefs/Misc/Unshaded.j3md");
        m.setColor("Color", ColorRGBA.Red);
        laser.setMaterial(m);
        laser.setLocalTranslation(ship.getLocalTranslation().add(0, 0, -1.5f));
        lasers.attachChild(laser);
    }

    private void spawnAsteroid() {
        float r = minRadius[level] + rng.nextFloat() * (maxRadius[level] - minRadius[level]);
        Geometry rock = new Geometry("asteroid", makeRockMesh(r));
        float shade = 0.35f + rng.nextFloat() * 0.2f;
        rock.setMaterial(lit(new ColorRGBA(shade + 0.1f, shade, shade - 0.08f, 1f)));
        rock.setLocalTranslation(
            (rng.nextFloat() - 0.5f) * 2f * spreadX[level],
            (rng.nextFloat() - 0.5f) * 2f * spreadY[level],
            -140);
        rock.setUserData("r", r);
        rock.setUserData("sx", (rng.nextFloat() - 0.5f) * 2f);
        rock.setUserData("sy", (rng.nextFloat() - 0.5f) * 2f);
        enemies.attachChild(rock);
    }

    private void setupKeys() {
        inputManager.addMapping("Left",  new KeyTrigger(KeyInput.KEY_A), new KeyTrigger(KeyInput.KEY_LEFT));
        inputManager.addMapping("Right", new KeyTrigger(KeyInput.KEY_D), new KeyTrigger(KeyInput.KEY_RIGHT));
        inputManager.addMapping("Up",    new KeyTrigger(KeyInput.KEY_W), new KeyTrigger(KeyInput.KEY_UP));
        inputManager.addMapping("Down",  new KeyTrigger(KeyInput.KEY_S), new KeyTrigger(KeyInput.KEY_DOWN));
        inputManager.addMapping("Shoot", new KeyTrigger(KeyInput.KEY_SPACE));
        inputManager.addMapping("Lvl1",  new KeyTrigger(KeyInput.KEY_1));
        inputManager.addMapping("Lvl2",  new KeyTrigger(KeyInput.KEY_2));
        inputManager.addMapping("Lvl3",  new KeyTrigger(KeyInput.KEY_3));

        inputManager.addListener((ActionListener) (name, pressed, tpf) -> {
            switch (name) {
                case "Left":  left = pressed;     break;
                case "Right": right = pressed;    break;
                case "Up":    up = pressed;       break;
                case "Down":  down = pressed;     break;
                case "Shoot": shooting = pressed; break;
                case "Lvl1":  if (pressed) setLevel(0); break;
                case "Lvl2":  if (pressed) setLevel(1); break;
                case "Lvl3":  if (pressed) setLevel(2); break;
            }
        }, "Left", "Right", "Up", "Down", "Shoot", "Lvl1", "Lvl2", "Lvl3");
    }

    @Override
    public void simpleUpdate(float tpf) {
        // Ship movement (kept inside the play area)
        float dx = (right ? 1 : 0) - (left ? 1 : 0);
        float dy = (up ? 1 : 0) - (down ? 1 : 0);
        ship.move(dx * shipSpeed * tpf, dy * shipSpeed * tpf, 0);
        Vector3f p = ship.getLocalTranslation();
        ship.setLocalTranslation(FastMath.clamp(p.x, -30f, 30f), FastMath.clamp(p.y, -16f, 16f), p.z);
        ship.setLocalRotation(new Quaternion().fromAngles(0, 0, -dx * 0.4f));

        // Auto-fire while Space is held
        fireCooldown -= tpf;
        if (shooting && fireCooldown <= 0f) {
            fireLaser();
            fireCooldown = 0.18f;
        }

        // Spawn asteroids based on the level
        spawnTimer += tpf;
        if (spawnTimer >= spawnEvery[level]) {
            spawnTimer = 0f;
            spawnAsteroid();
        }

        // Move lasers forward
        for (Spatial l : lasers.getChildren().toArray(new Spatial[0])) {
            l.move(0, 0, -60f * tpf);
            if (l.getLocalTranslation().z < -160) {
                l.removeFromParent();
            }
        }

        // Move and tumble asteroids
        for (Spatial e : enemies.getChildren().toArray(new Spatial[0])) {
            float sx = e.getUserData("sx");
            float sy = e.getUserData("sy");
            e.move(0, 0, asteroidSpeed[level] * tpf);
            e.rotate(sx * tpf, sy * tpf, 0);
            if (e.getLocalTranslation().z > 25) {
                e.removeFromParent();
            }
        }

        checkLaserHits();
    }

    private void checkLaserHits() {
        for (Spatial l : lasers.getChildren().toArray(new Spatial[0])) {
            Vector3f lp = l.getLocalTranslation();
            for (Spatial e : enemies.getChildren().toArray(new Spatial[0])) {
                Vector3f ep = e.getLocalTranslation();
                float r = e.getUserData("r");
                float reach = r * 1.25f + 0.25f;
                boolean hit = Math.abs(lp.x - ep.x) < reach
                           && Math.abs(lp.y - ep.y) < reach
                           && Math.abs(lp.z - ep.z) < r + 2.5f;
                if (hit) {
                    l.removeFromParent();
                    e.removeFromParent();
                    score += 10;
                    updateHud();
                    break;
                }
            }
        }
    }
}